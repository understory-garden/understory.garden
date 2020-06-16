import { useState, useEffect } from 'react'

import { foaf } from 'rdf-namespaces'

import useSWR, { mutate } from 'swr'

import factory from '@graphy/core.data.factory'
import newDataset from '@graphy/memory.dataset.fast'

import useDataset, { fetchDataset, patchDataset } from "../hooks/useDataset"

function copyDataset(dataset){
  const d = newDataset()
  d.addQuads(dataset)
  return d
}

class DatasetObject {
  constructor(subjectUri, dataset, defaultGraph, bindings){
    this.subjectUri = subjectUri
    this.subjectNamedNode = factory.namedNode(subjectUri)
    this.originalDataset = dataset
    this.dataset = copyDataset(dataset)
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
    const uri = this.defaultGraph.value
    const newDataset = copyDataset(this.dataset).canonicalize()
    const result = await mutate(uri, async (cachedDataset) => {
      const response = await patchDataset(this.subjectUri, cachedDataset, newDataset)
      if (response.status == "200") {
        return newDataset
      } else {
        console.log("response other than a 200, reverting to cached object", response)
        return cachedDataset
      }
    }, false)
    return result
  }
}

export default function useObject(uri, bindings, options={}){
  const { dataset, documentUri, ...props } = useDataset(uri, options)
  const [object, setObject] = useState()
  useEffect(() => {
    if (dataset){
      setObject(new DatasetObject(uri, dataset, factory.namedNode(documentUri), {}))
    }
  }, [dataset])
  return ({ object, ...props })
}
