import {
  createThing, setStringNoLocale,  getUrl
} from '@inrupt/solid-client'
import { conceptNameToUrlSafeId } from '../utils/uris'
import { US } from '../vocab'

const thingName = "concept"

export function createNote(){
  return createThing({name: thingName})
}

export function noteStorageFileAndThingName(name){
  return `${conceptNameToUrlSafeId(name)}.ttl#${thingName}`
}

export function defaultNoteStorageUri(workspace, name){
  const containerUri = workspace && getUrl(workspace, US.noteStorage)
  return containerUri && `${containerUri}${noteStorageFileAndThingName(name)}`
}

export function createOrUpdateNoteBody(note, value) {
  let newNote = note || createNote()
  newNote = setStringNoLocale(newNote, US.noteBody, JSON.stringify(value))
  return newNote
}

export function createOrUpdateSlateJSON(note, value) {
  let newNote = note || createNote()
  newNote = setStringNoLocale(newNote, US.slateJSON, JSON.stringify(value))
  return newNote
}