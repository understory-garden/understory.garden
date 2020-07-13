import useSWR from 'swr'
import {
  fetchLitDataset, getThingOne, saveLitDatasetAt, setThing
} from '@solid/lit-pod'

function useThing(uri, ...args){
  const documentURL = uri && new URL(uri)
  if (documentURL) {
    documentURL.hash = ""
  }
  const documentUri = documentURL && documentURL.toString()
  const { data, mutate, ...rest } = useSWR(documentUri, fetchLitDataset, ...args)
  const thing  = data && getThingOne(data, uri)
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
      save,
      ...rest
    }
  )
}

export default useThing;
