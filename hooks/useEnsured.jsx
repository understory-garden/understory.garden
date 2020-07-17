import { useState, useEffect } from "react"
import auth from 'solid-auth-client';

export const resourceExists = async resourcePath => {
  const result = await auth.fetch(resourcePath);
  return result.status === 403 || result.status === 200;
};

export const createDoc = async (documentUri, options) => {
  try {
    return await auth.fetch(documentUri, options);
  } catch (e) {
    throw e;
  }
};

export const createDocument = async (documentUri, body = '') => {
  try {
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/turtle'
      },
      body
    };
    return await createDoc(documentUri, options);
  } catch (e) {
    throw e;
  }
};

export const deleteFile = async url => {
  try {
    return await auth.fetch(url, { method: 'DELETE' });
  } catch (e) {
    throw e;
  }
};

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
