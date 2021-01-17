import {
  setUrl, getUrl, getStringNoLocale, setStringNoLocale, createThing, setThing,
  saveSolidDatasetInContainer, createSolidDataset
} from '@inrupt/solid-client'
import { LDP, FOAF, RDFS, DCTERMS } from '@inrupt/vocab-common-rdf'
import { fetch } from 'solid-auth-fetcher'

export async function sendMessage(inboxUri, senderWebId, title, message){
  var msg = createThing({name: "message"})
  msg = setStringNoLocale(msg, RDFS.label, title)
  msg = setStringNoLocale(msg, RDFS.comment, message)
  msg = setUrl(msg, DCTERMS.creator, senderWebId)
  const data = setThing(createSolidDataset(), msg)
  return saveSolidDatasetInContainer(inboxUri, data, {fetch})
}
