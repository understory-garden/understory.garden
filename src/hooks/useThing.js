import useSWR from 'swr'
import {
  fetchLitDataset, getThingOne, saveLitDatasetAt, setThing, getUrlAll,
  unstable_fetchLitDatasetWithAcl,
  unstable_fetchFile, unstable_overwriteFile, unstable_fetchFileWithAcl
} from '@itme/solid-client'
import { ldp } from "rdf-namespaces"

import equal from 'fast-deep-equal/es6'

export function useFile(uri, { compare, acl, ...options } = {}) {
  const fetch = acl ? unstable_fetchFileWithAcl : unstable_fetchFile

  options.compare = compare || equal

  const { data: file, mutate, ...rest } = useSWR(uri, fetch, options)
  const save = async (blob) => {
    mutate(blob, false)
    const savedDataset = await unstable_overwriteFile(uri, blob)
    mutate(blob)
    return savedDataset
  }
  return (
    {
      file,
      mutate,
      save,
      ...rest
    }
  )
}

export function useResource(uri, { compare, acl, ...options } = {}) {
  const fetch = acl ? unstable_fetchLitDatasetWithAcl : fetchLitDataset

  options.compare = compare || equal

  const { data: resource, mutate, ...rest } = useSWR(uri, fetch, options)
  const save = async (newDataset) => {
    mutate(newDataset, false)
    const savedDataset = await saveLitDatasetAt(uri, newDataset)
    mutate(savedDataset)
    return savedDataset
  }
  return (
    {
      resource,
      mutate,
      save,
      ...rest
    }
  )
}

function useThing(uri, options = {}) {
  const documentURL = uri && new URL(uri)
  if (documentURL) {
    documentURL.hash = ""
  }
  const documentUri = documentURL && documentURL.toString()
  const { resource, mutate, save: saveResource, ...rest } = useResource(uri, options)
  const thing = resource && getThingOne(resource, uri)
  const save = async (newThing) => {
    const newDataset = setThing(resource, newThing)
    return saveResource(documentUri, newDataset)
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
