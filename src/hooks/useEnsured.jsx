import { useState, useEffect } from "react"

import { resourceExists, createDocument, deleteFile } from '~lib/http'

export default function useEnsured(url) {
  const [ensuredUrl, setEnsuredUrl] = useState()
  useEffect(() => {
    async function ensureUrl() {
      if (await resourceExists(url)) {
        setEnsuredUrl(url)
      } else {
        await createDocument(`${url}.dummy`)
        await deleteFile(`${url}.dummy`)
        setEnsuredUrl(url)
      }

    }
    if (url) {
      ensureUrl()
    }
  }, [url])
  return ensuredUrl
}
