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

export const fetchDataset = async (uri, ...args) => {
  const response = await auth.fetch(uri, ...args)
  const dataset = await loadData(response, newDataset())
  dataset.response = response
  return dataset
}

export default function useDataset(uri, options={}){
  const { data: dataset, ...props } = useSWR(uri, fetchDataset, {
    compare: (a, b) => (a === b) || (a && b && a.equals(b)),
  })
  return { dataset, ...props }
}
