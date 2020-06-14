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
  }

  get nameQuads(){
    return Array.from(this.dataset.match(this.subjectNamedNode, this.nameNamedNode))
  }

  get name(){
    return this.nameQuads[0].object.value
  }

  set name(newName){
    this.dataset.delete(...this.nameQuads)
    this.dataset.add(factory.quad(this.subjectNamedNode, this.nameNamedNode, factory.namedNode(newName), this.defaultGraph))
  }
}

export default function useObject(uri, bindings){
  const { dataset, graph } = useDataset(uri)
  const object = dataset && new DatasetObject(uri, dataset, graph, {})
  return ({ object })
}
