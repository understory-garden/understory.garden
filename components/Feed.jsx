import { useState } from 'react'
import { useThing, useProfile } from 'swrlit'
import Link from 'next/link'
import InfiniteScroll from 'react-infinite-scroll-component';
import { getUrl, getStringNoLocale } from '@inrupt/solid-client'
import { FOAF } from '@inrupt/vocab-common-rdf'

import { profilePath, publicNotePath, noteUriToName, noteUriToWebId } from '../utils/uris'

const feedItems = [
  "https://cassette.loves.face.baby/public/itme/facebaby/concepts/SHOCKING%20REVEAL!!!%20100%25%20GENUINE!.ttl",
  "https://www.loves.face.baby/public/itme/facebaby/concepts/soul%20monetization.ttl#concept",
  "https://www.loves.face.baby/public/itme/facebaby/concepts/%E2%98%A0%EF%B8%8F.ttl#concept",
  "https://www.loves.face.baby/public/itme/facebaby/concepts/The%20Face%20Baby.ttl#concept"
]

function FeedItem({uri}){
  const name = noteUriToName(uri)
  const webId = noteUriToWebId(uri)
  const { profile } = useProfile(webId)
  const authorName = profile && getStringNoLocale(profile, FOAF.name)
  const { thing: note } = useThing(uri)
  const coverImage = note && getUrl(note, FOAF.img)
  return (
    <div className="relative overflow-y-hidden flex-none h-36 bg-gray-600 mb-12 rounded-lg">
      {coverImage && <img className="w-full" src={coverImage}/>}

      <div className="pb-24 pt-3 text-center absolute top-0 left-0 w-full bg-gradient-to-b from-black">
        <h2 className="text-5xl mb-1">
          <Link href={publicNotePath(webId, name)}>
            <a>
              {name}
            </a>
          </Link>
        </h2>
        <h4 className="text-2xl">
          by&nbsp;
          <Link href={profilePath(webId)}>
            <a>
              {authorName}
            </a>
          </Link>
        </h4>
      </div>
    </div>
  )
}

export default function Feed(){
  const [n, setN] = useState(3)
  const items = feedItems.slice(0, n)
  function fetchData(x){
    setN(m => m + 3)
  }
  return (
    <div className="flex flex-col">
      <InfiniteScroll
        dataLength={items.length}
        next={fetchData}
        hasMore={n < feedItems.length}
        loader={<h4>Loading...</h4>}
        endMessage={
          <p className="text-center font-logo">
            <b>that's it, check back soon...</b>
          </p>
        }
        scrollableTarget="page"
        // below props only if you need pull down functionality
        //refreshFunction={this.refresh}
        //pullDownToRefresh
        //pullDownToRefreshThreshold={50}
        //pullDownToRefreshContent={
        //  <h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3>
        //}
        //releaseToRefreshContent={
        //  <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
        //}
      >
        {items.map(uri => (
          <FeedItem uri={uri} key={uri} />
        ))}
      </InfiniteScroll>
    </div>
  )
}
