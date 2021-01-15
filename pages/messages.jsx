import { useState } from 'react'

import { useMyProfile, useProfile, useContainer, useEnsured, useThing } from 'swrlit'
import {
  getUrl, asUrl, getStringNoLocale, setStringNoLocale, saveSolidDatasetInContainer, deleteSolidDataset,
  createThing, setThing, createSolidDataset, setUrl
} from '@inrupt/solid-client'
import { LDP, RDFS, DCTERMS, FOAF } from '@inrupt/vocab-common-rdf'
import { fetch } from 'solid-auth-fetcher'
import Link from 'next/link'
import InfiniteScroll from 'react-infinite-scroll-component'

import Nav from '../components/nav'
import TabButton from '../components/TabButton'
import { useFacebabyContainerUri, useArchiveContainerUri } from '../hooks/uris'
import { profilePath } from '../utils/uris'


function Message({resource, onDelete}){
  const messageUri = asUrl(resource)
  const { thing: message, resource: messageResource } = useThing(messageUri && `${messageUri}#message`)
  const title = message && getStringNoLocale(message, RDFS.label)
  const body = message && getStringNoLocale(message, RDFS.comment)
  const authorWebId = message && getUrl(message, DCTERMS.creator)
  const {profile: author} = useProfile(authorWebId)
  const name = author && getStringNoLocale(author, FOAF.name)

  const archiveContainerUri = useArchiveContainerUri()
  async function archive(){
    var msg = createThing({name: "message"})
    msg = setStringNoLocale(msg, RDFS.label, title)
    msg = setStringNoLocale(msg, RDFS.comment, body)
    msg = authorWebId ? setUrl(msg, DCTERMS.creator, authorWebId) : msg
    const data = setThing(createSolidDataset(), msg)
    await saveSolidDatasetInContainer(archiveContainerUri, data, { fetch })
    await deleteSolidDataset(messageResource, { fetch })
    onDelete(resource)
  }
  return (
    <div className="m-6 bg-gray-800 p-6">
      <h3 className="text-center text-3xl mb-3">
        {title}
      </h3>
      {author && (
        <h4>
          from&nbsp;
          <Link href={profilePath(authorWebId)}>
            <a>
              {name}
            </a>
          </Link>
        </h4>
      )}
      <p>
        {body}
      </p>
      <div className="flex flex-row mt-6">
        <button className="btn mr-3">reply</button>
        {onDelete && <button className="btn m3" onClick={archive}>archive</button>}
      </div>
    </div>
  )
}

function Inbox(){
  const { profile } = useMyProfile()
  const inboxUri = profile && getUrl(profile, LDP.inbox)
  const { resources, mutate } = useContainer(inboxUri)
  function onDelete(resource){
    mutate()
  }
  return (
    <div>
      {resources && resources.map(resource => (
        <Message resource={resource} onDelete={onDelete} key={asUrl(resource)}/>
      ))}
    </div>
  )
}

function Archive(){
  const archiveContainerUri = useArchiveContainerUri()
  const { resources } = useContainer(archiveContainerUri)
  const [n, setN] = useState(3)
  const items = resources ? resources.slice(0, n) : []
  function fetchData(x){
    setN(m => m + 3)
  }
  return (
    <div>
      <InfiniteScroll
        dataLength={items.length}
        next={fetchData}
        hasMore={resources ? (n < resources.length) : false}
        loader={<h4>Loading...</h4>}
        endMessage={
          <p className="text-center font-logo">
            <b>that's all there is...</b>
          </p>
        }
        scrollableTarget="page">

        {items && items.map(resource => (
          <Message resource={resource} key={asUrl(resource)} />
        ))}
        </InfiniteScroll>
    </div>
  )
}

export default function MessagesPage () {
  const [tab, setTab] = useState("inbox")
  return (
    <div className="page" id="page">
      <Nav />
      <div>
        <h2 className="text-4xl mb-6">Messages</h2>
        <div className="mb-6">
          <TabButton name="inbox" activeName={tab} setTab={setTab}>
            inbox
          </TabButton>
          <TabButton name="archive" activeName={tab} setTab={setTab}>
            archive
          </TabButton>
        </div>
        {tab === "inbox" ? (
          <Inbox/>
        ) : (tab === "archive" ? (
          <Archive/>
        ) : (
          <div className="font-logo">
            no messages from aliens here, no sirree
          </div>
        ))}
      </div>
    </div>
  )
}
