import { foaf } from 'rdf-namespaces'

import factory from '@graphy/core.data.factory'
import newDataset from '@graphy/memory.dataset.fast'

import useDataset from "../hooks/useDataset"



class DatasetObject {
  constructor(subjectUri, dataset, defaultGraph, bindings){
    this.subjectNamedNode = factory.namedNode(subjectUri)
    this.dataset = dataset
    this.defaultGraph = defaultGraph
    this.updates = newDataset();
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
    this.dataset.add(factory.quad(this.subjectNamedNode, this.nameNamedNode, factory.namedNode(newName), this.defaultGraph))
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
}

export default function useObject(uri, bindings){
  const { dataset, graph } = useDataset(uri)
  const object = dataset && new DatasetObject(uri, dataset, graph, {})
  return ({ object })
}
