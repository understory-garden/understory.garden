import { useState } from 'react'

import { useRouter } from 'next/router'
import { useMyProfile, useProfile, useContainer, useEnsured, useWebId } from 'swrlit'
import {
  setUrl, getUrl, getStringNoLocale, setStringNoLocale, createThing, setThing,
  saveSolidDatasetInContainer, createSolidDataset
} from '@inrupt/solid-client'
import { LDP, FOAF, RDFS, DCTERMS } from '@inrupt/vocab-common-rdf'
import { fetch } from 'solid-auth-fetcher'

import Nav from '../../../components/nav'
import { handleToWebId } from "../../../utils/uris"



export default function MessagePage () {
  const router = useRouter()
  const { query: { handle } } = router
  const webId = handleToWebId(handle)
  const myWebId = useWebId()
  const { profile } = useProfile(webId)
  const inboxUri = profile && getUrl(profile, LDP.inbox)
  const name = profile && getStringNoLocale(profile, FOAF.name)
  const [sent, setSent] = useState(false)

  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  async function sendMessage(){
    var msg = createThing({name: "message"})
    msg = setStringNoLocale(msg, RDFS.label, title)
    msg = setStringNoLocale(msg, RDFS.comment, message)
    msg = setUrl(msg, DCTERMS.creator, myWebId)
    const data = setThing(createSolidDataset(), msg)
    await saveSolidDatasetInContainer(inboxUri, data, {fetch})
    setTitle("")
    setMessage("")
    setSent(true)
  }
  return (

    <div className="page">
      <Nav />
      <div className="pt-6 flex flex-col">
        <h2 className="text-4xl mb-6 text-center">send {name} a message</h2>
        {sent && <div className="text-xl color-purple-500 mb-3">sent!</div>}
        <input value={title} placeholder="title"
               className="focus:ring-0 mb-3 pl-3 border-2 border-gray-500 bg-black w-full text-2xl"
               onChange={e => setTitle(e.target.value)}
        />
        <textarea value={message}
                  placeholder="message body"
                  onChange={e => setMessage(e.target.value)}
                  className="focus:ring-0 focus:border-gray-500 resize-none bg-black w-full h-72 text-xl" autoFocus/>
        <button className="btn text-5xl px-6 py-3 mt-6" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  )
}
