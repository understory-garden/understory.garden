import { useState } from 'react'
import { useProfile } from 'swrlit'
import { getThingAll, asUrl, getUrl, getStringNoLocale, getDecimal } from '@inrupt/solid-client'
import { FOAF } from '@inrupt/vocab-common-rdf'
import Link from 'next/link'
import InfiniteScroll from 'react-infinite-scroll-component';

import { useLedger } from '../hooks/feed'
import { accountOf, amount } from '../vocab'
import { profilePath } from '../utils/uris'
import Nav from '../components/nav'

function Entry({entry}){
  const webId = getUrl(entry, accountOf)
  const { profile } = useProfile(webId)
  const name = profile && getStringNoLocale(profile, FOAF.name)
  const amountNumber = getDecimal(entry, amount)

  return (
    <div className="m-6 text-3xl text-center">
      Credit for <Link href={profilePath(webId)}><a>{name}</a></Link> in the amount of <span className="text-green-300">{amountNumber}</span> 😀💰
    </div>
  )
}

export default function LedgerPage(){
  const { ledger } = useLedger()
  const entries = ledger && getThingAll(ledger)
  const [n, setN] = useState(10)
  const items = entries && entries.slice(0, n)
  function fetchData(x){
    setN(m => m + 10)
  }
  return (
    <div className="page" id="page">
      <Nav/>
      <h3 className="mt-12 text-5xl text-center">
        PERMANENT AND ETERNAL LEDGER OF FACEBUX (😀💰)
      </h3>
      <p className="mt-6 text-xl text-center">
        this ledger tracks the net worth of the digital souls of all monetized users of face.baby.
      </p>
      <p className="mt-6 text-xl text-center">
        if you believe you have content worthy of being compensated in FACEBUX please contact the adminstrators or just leave your content in a chatroom, we'll probably find it.
      </p>
      <ul>
        {items && (
          <InfiniteScroll
            dataLength={items.length}
            next={fetchData}
            hasMore={(n < entries.length)}
            loader={<h4>Loading...</h4>}
            endMessage={
              <p className="text-center font-logo">
                <b>that's it, check back soon...</b>
              </p>
            }
            scrollableTarget="page"
            >
            {entries.reverse().map(entry => (
              <Entry entry={entry} key={asUrl(entry)}/>
            ))}
            </InfiniteScroll>
        ) }
      </ul>
    </div>
  )
}
