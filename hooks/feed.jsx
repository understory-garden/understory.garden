import { useWebId, useThing, useResource } from 'swrlit'
import { getUrlAll, getThing, getDecimal, getThingAll, getUrl } from '@inrupt/solid-client'
import { FB } from '../vocab'
const { hasFeedItem, accountOf, amount } = FB
const feedItems = [
  "https://cassette.loves.face.baby/public/itme/facebaby/concepts/SHOCKING%20REVEAL!!!%20100%25%20GENUINE!.ttl#concept",
  "https://www.loves.face.baby/public/itme/facebaby/concepts/soul%20monetization.ttl#concept",
  "https://www.loves.face.baby/public/itme/facebaby/concepts/%E2%98%A0%EF%B8%8F.ttl#concept",
  "https://www.loves.face.baby/public/itme/facebaby/concepts/The%20Face%20Baby.ttl#concept"
]

export function useFeed(){
  const {thing: feed, ...rest} = useThing("https://toby.loves.face.baby/public/itme/facebaby/feed.ttl#feed")
  return {feed, ...rest}
}

export function useLedger(){
  const {resource: ledger, ...rest} = useResource("https://toby.loves.face.baby/public/itme/facebaby/ledger.ttl")
  return {ledger, ...rest}
}


export function useLedgerTotalFor(webId){
  const { ledger } = useLedger()
  const ledgerEntries = ledger && getThingAll(ledger)
  const myLedgerEntries = ledgerEntries && ledgerEntries
        .filter(e => (getUrl(e, accountOf) === webId))
  const total = myLedgerEntries && myLedgerEntries.reduce((total, e) => total + getDecimal(e, amount), 0)
  return total
}

export function useMyLedgerTotal(){
  const webId = useWebId()
  return useLedgerTotalFor(webId)
}

export function useFeedItems(){
  const { feed } = useFeed()
  return { feedItems: feed && getUrlAll(feed, hasFeedItem).reverse() }
}

export function useIsFeedAdmin(){
  const webId = useWebId()
  return webId === "https://toby.loves.face.baby/profile/card#me"
}
