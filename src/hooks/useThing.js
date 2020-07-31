import useSWR from 'swr'
import {
  fetchLitDataset, getThingOne, saveLitDatasetAt, setThing, getUrlAll
} from '@solid/lit-pod'
import { ldp } from "rdf-namespaces"

import equal from 'fast-deep-equal/es6'

function useThing(uri, { compare, ...options } = {}) {
  const documentURL = uri && new URL(uri)
  if (documentURL) {
    documentURL.hash = ""
  }
  const documentUri = documentURL && documentURL.toString()
  options.compare = compare || equal

  const { data, mutate, ...rest } = useSWR(documentUri, fetchLitDataset, options)
  const thing = data && getThingOne(data, uri)
  const save = async (newThing) => {
    const newDataset = setThing(data, newThing)
    mutate(newDataset, false)
    const savedDataset = await saveLitDatasetAt(documentUri, newDataset)
    mutate(savedDataset)
    return savedDataset
  }
  return (
    {
      thing,
      mutate,
      save,
      ...rest
    }
  )
}


export function useContainer(uri, { compare, ...options } = {}) {
  options.compare = compare || equal
  const { data, ...rest } = useSWR(uri, fetchLitDataset, options)
  const resourceUrls = data && getUrlAll(data, ldp.contains)
  const resources = resourceUrls && resourceUrls.map(url => {
    return getThingOne(data, url)
  })
  return { resources, ...rest }

}

export default useThing;
