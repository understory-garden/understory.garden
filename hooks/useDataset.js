import { useEffect, useState } from 'react'
import useSWR from 'swr'
import auth from 'solid-auth-client'
import newDataset from '@graphy/memory.dataset.fast'
import readTtl from '@graphy/content.ttl.read'
import factory from '@graphy/core.data.factory'
import ttlScribe from '@graphy/content.ttl.scribe'

function readToNewDatasetConfig(graphUri, resolve, reject){
  const dataset = newDataset()
  return (
    {
      data(yQuad) {
        yQuad.graph = factory.namedNode(graphUri)
        dataset.add(yQuad);
      },

      eof(h_prefixes) {
        dataset.canonicalize()
        resolve(dataset)
      },

      error(e) {
        reject(e)
      },

      baseUri: graphUri
    }
  )
}

export const responseToDataset = (response) => new Promise((resolve, reject) => {
  const ttlReader = readTtl(readToNewDatasetConfig(response.url, resolve, reject));
  const bodyReader = response.body.getReader();
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

const datasetFetcher = (fetch) => (...args) => fetch(...args).then(responseToDataset)

const fetchDataset = datasetFetcher(auth.fetch)

export async function quadsToString(quads) {
  return new Promise((resolve, reject) => {
    const result = []
    const scriber = ttlScribe({
      data(s_turtle){
        result.push(s_turtle)
      },

      finish() {
        resolve(result.join(""))
      },

      error(e) {
        reject(e)
      }
    })
    for (const quad of quads){
      if (quad.subject.isBlankNode){
        console.log("ignoring blank node")
      } else {
        scriber.write(quad)
      }
    }
    scriber.end()
  })
}

async function patchDatasetBody(deleteQuads, insertQuads) {
  const deleteStatement = (deleteQuads.size > 0)
        ? `DELETE DATA {${await quadsToString(deleteQuads)}};`
        : '';
  const insertStatement = (insertQuads.size > 0)
        ? `INSERT DATA {${await quadsToString(insertQuads)}};`
        : '';

  return `${deleteStatement} ${insertStatement}`
}


export const patchDataset = async (uri, from, to) => {
  return auth.fetch(uri, {
    method: "PATCH",
    body: await patchDatasetBody(from.minus(to), to.minus(from)),
    headers: {
      'Content-Type': 'application/sparql-update',
    },
  })
}

const defaultOptions = {}

export default function useDataset(uri, options=defaultOptions){
  const documentURL = uri && new URL(uri)
  if (documentURL) {
    documentURL.hash = ""
  }
  const documentUri = documentURL && documentURL.toString()
  const fetcher = options.fetch ? datasetFetcher(options.fetch) : fetchDataset
  const { data: dataset, ...props } = useSWR(documentUri, fetcher, {
    compare: (a, b) => (a === b) || (a && b && a.equals(b)),
  })
  return { dataset, documentUri, ...props }
}
