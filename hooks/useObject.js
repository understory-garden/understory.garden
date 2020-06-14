import { foaf } from 'rdf-namespaces'

import factory from '@graphy/core.data.factory'
import newDataset from '@graphy/memory.dataset.fast'

import useDataset from "../hooks/useDataset"

class DatasetObject {
  constructor(subjectUri, dataset, bindings){
    this.subjectNamedNode = factory.namedNode(subjectUri)
    this.dataset = dataset
    this.updates = newDataset();
    this.bindings = bindings
  }

  get name(){
    return Array.from(this.dataset.match(this.subjectNamedNode, factory.namedNode(foaf.name))).map(q => q.object.value)[0]
  }

  set name(newName){

  }
}

export default function useObject(uri, bindings){
  const { dataset } = useDataset(uri)
  const object = dataset && new DatasetObject(uri, dataset, {})
  return ({ object })
}
