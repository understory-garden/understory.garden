import useSWR from 'swr'
import {
  getSolidDataset, getThing, saveLitDatasetAt, setThing, getUrlAll,
  getSolidDatasetWithAcl,
  getFile, overwriteFile, getFileWithAcl
} from '@itme/solid-client'
import { ldp } from "rdf-namespaces"

import equal from 'fast-deep-equal/es6'

export function useFile(uri, { compare, acl, ...options } = {}) {
  const fetch = acl ? getFileWithAcl : getFile

  options.compare = compare || equal

  const { data: file, mutate, ...rest } = useSWR(uri, fetch, options)
  const save = async (blob) => {
    mutate(blob, false)
    const savedDataset = await overwriteFile(uri, blob)
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

export function useMeta(uri, options = {}) {
  const { resource: meta, ...rest } = useResource(uri && `${uri}.meta`, options)
  return ({
    meta, ...rest
  })
}

export function useResource(uri, { compare, acl, ...options } = {}) {
  const fetch = acl ? getSolidDatasetWithAcl : getSolidDataset
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
  const thing = resource && getThing(resource, uri)
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
  const { data, ...rest } = useSWR(uri, getSolidDataset, options)
  const resourceUrls = data && getUrlAll(data, ldp.contains)
  const resources = resourceUrls && resourceUrls.map(url => {
    return getThing(data, url)
  })
  return { resources, ...rest }

}

export default useThing;
