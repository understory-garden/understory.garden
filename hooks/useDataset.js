import { useEffect, useState } from 'react'
import useSWR from 'swr'
import auth from 'solid-auth-client'
import newDataset from '@graphy/memory.dataset.fast'
import readTtl from '@graphy/content.ttl.read'
import factory from '@graphy/core.data.factory'

const loadData = (response, dataset) => new Promise((resolve, reject) => {
  const bodyReader = response.body.getReader();
  const ttlReader = readTtl({
    data(yQuad) {
      yQuad.graph = factory.namedNode(response.url)
      dataset.add(yQuad);
    },

    eof(h_prefixes) {
      resolve(dataset)
    },
    baseUri: response.url
  });

  function next() {
    bodyReader.read().then(read_chunk);
  }

  function read_chunk({value, done}) {
    if(done) {
      ttlReader.end();
      return;
    }

    ttlReader.write(value);
    next();
  }

  next();
})

export default function useDataset(uri){
  const { data, error } = useSWR(uri, auth.fetch)
  const [dataset, setDataset] = useState()
  const [graph, setGraph] = useState()
  useEffect(
    () => {
      if (data && !data.bodyUsed){
        async function loadDataset(){
          setDataset(await loadData(data, newDataset()))
          setGraph(factory.namedNode(data.url))
        }
        loadDataset()
      }
    }
    , [data]
  )
  return { dataset, graph, error }
}
