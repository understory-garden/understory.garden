import { useState, useEffect } from 'react'

import { foaf } from 'rdf-namespaces'

import useSWR, { mutate } from 'swr'

import factory from '@graphy/core.data.factory'
import newDataset from '@graphy/memory.dataset.fast'

import useDataset, { fetchDataset, patchDataset } from "../hooks/useDataset"

class DatasetObject {
  constructor(subjectUri, dataset, defaultGraph, bindings){
    this.subjectUri = subjectUri
    this.subjectNamedNode = factory.namedNode(subjectUri)
    this.originalDataset = dataset.canonicalize()
    this.dataset = dataset
    this.defaultGraph = defaultGraph
    this.bindings = bindings

    this.nameNamedNode = factory.namedNode(foaf.name)
    this.knowsNamedNode = factory.namedNode(foaf.knows)
  }

  get nameQuads(){
    return this.dataset.match(this.subjectNamedNode, this.nameNamedNode)
  }

  get nameObject(){
    for (const quad of this.nameQuads){
      return quad.object
    }
  }

  get name(){
    return this.nameObject.value
  }

  set name(newName){
    this.dataset.delete(...this.nameQuads)
    this.dataset.add(factory.quad(this.subjectNamedNode, this.nameNamedNode, factory.literal(newName), this.defaultGraph))
  }

  get knowsQuads(){
    return this.dataset.match(this.subjectNamedNode, this.knowsNamedNode)
  }

  get knowsObjects(){
    return Array.from(this.knowsQuads).map(q => q.object)
  }

  get knows(){
    return this.knowsObjects.map(o => o.value)
  }

  addKnows(newKnows){
    this.dataset.add(factory.quad(this.subjectNamedNode, this.knowsNamedNode,
                                  factory.namedNode(newKnows), this.defaultGraph))
  }

  deleteKnows(knows){
    this.dataset.delete(factory.quad(this.subjectNamedNode, this.knowsNamedNode,
                                     factory.namedNode(knows), this.defaultGraph))
  }

  async save(){
    const newObject = new DatasetObject(this.subjectUri, this.dataset, this.defaultGraph, this.bindings)
    mutate(this.subjectUri, newObject, false)

    const result = await mutate(this.subjectUri, async (cachedObject) => {
      const response = await patchDataset(this.subjectUri, this.originalDataset, this.dataset.canonicalize())
      if (response.status == "200") {
        return newObject
      } else {
        console.log("response other than a 200, reverting to cached object", response)
        return cachedObject
      }
    }, false)
    return result
  }
}

export const fetchObject = async (uri, ...args) => {
  const dataset = await fetchDataset(uri, ...args)
  const response = dataset.response
  const graph = factory.namedNode(response.url)
  const object = dataset && new DatasetObject(uri, dataset, graph, {})
  return object
}

export default function useObject(uri, bindings, options={}){
  const { dataset, documentUri} = useDataset(uri, options)
  const [object, setObject] = useState()
  useEffect(() => {
    if (dataset){
      setObject(new DatasetObject(uri, dataset, factory.namedNode(documentUri), {}))
    }
  }, [dataset])
  const { data, ...props } = useSWR(
    uri, fetchObject,
    {
      compare: (a, b) => (a === b) || (a && b && a.originalDataset.equals(b.originalDataset)),
      ...options
    })
  return ({ object: data, ...props })
}
