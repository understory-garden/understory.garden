import { useState, useEffect } from 'react'
import Head from 'next/head'

import useSWR from 'swr'
import auth from 'solid-auth-client'
import {
  fetchLitDataset, getThingOne, getStringNoLocaleOne, getUrlAll, removeUrl, addUrl,
  saveLitDatasetAt, setThing
} from '@solid/lit-pod'
import { foaf } from 'rdf-namespaces'

import useWebId from "../hooks/useWebId"
import useObject from "../hooks/useObject"


function AuthButton(){
  const webId = useWebId()
  if (webId === undefined){
    return <div>loading...</div>
  } else if (webId === null) {
    return (
      <button onClick={() => auth.popupLogin({ popupUri: "/popup.html" })}>
        Log In
      </button>
    )
  } else {
    return <button onClick={() => auth.logout()}>Log Out</button>
  }
}

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

function Profile(){
  const webId = useWebId()
  const {thing: profile, save: saveProfile} = useThing(webId)
  const name = profile && getStringNoLocaleOne(profile, foaf.name)
  const knows = profile && getUrlAll(profile, foaf.knows)
  const [saving, setSaving] = useState(false)
  if (profile){
    return (
      <>
        <div>
          hello, {name}
        </div>
        {knows && knows.map(url => (
          <p key={url}>{url}</p>
        ))}
        {saving && "saving?"}
        <button onClick={
                  async () => {
                    await saveProfile(removeUrl(profile, foaf.knows, "https://lordvacon.inrupt.net/profile/card#me"))
                  }}
                disabled={saving}
        >
          remove knows
        </button>
        <button onClick={
                  async () => {
                    await saveProfile(addUrl(profile, foaf.knows, "https://lordvacon.inrupt.net/profile/card#me"))
                  }}
                disabled={saving}
        >
          add knows
        </button>
      </>
    )
  } else {
    return <div>loading...</div>
  }

}

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <AuthButton/>
        <Profile />
        <h1 className="title">
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>
      </main>

      <footer>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className="logo" />
        </a>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer img {
          margin-left: 0.5rem;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          max-width: 800px;
          margin-top: 3rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        .logo {
          height: 1em;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
