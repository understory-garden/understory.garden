import { useEffect, useState } from 'react'
import useSWR from 'swr'
import auth from 'solid-auth-client'
import newDataset from '@graphy/memory.dataset.fast'
import readTtl from '@graphy/content.ttl.read'
import factory from '@graphy/core.data.factory'
import ttlScribe from '@graphy/content.ttl.scribe'


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

    error(e) {
      reject(e)
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
        console.debug("ignoring blank node")
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

export default function useDataset(uri, options={}){
  const documentURL = uri && new URL(uri)
  if (documentURL) {
    documentURL.hash = ""
  }
  const documentUri = documentURL && documentURL.toString()
  const { data: dataset, ...props } = useSWR(documentUri, fetchDataset, {
    compare: (a, b) => (a === b) || (a && b && a.equals(b)),
  })
  return { dataset, documentUri, ...props }
}
