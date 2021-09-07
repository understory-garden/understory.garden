import {
  createThing,
  setStringNoLocale,
  getUrl,
  createSolidDataset,
  saveSolidDatasetAt,
} from "@inrupt/solid-client";
import { conceptNameToUrlSafeId } from "../utils/uris";
import { saveThing } from "../utils/fetch";
import { US } from "../vocab";

const thingName = "concept";

export function createNote() {
  return createThing({ name: thingName });
}

export function noteStorageFileAndThingName(name) {
  return `${conceptNameToUrlSafeId(name)}.ttl#${thingName}`;
}

export function defaultNoteStorageUri(workspace, name) {
  const containerUri = workspace && getUrl(workspace, US.noteStorage);
  return containerUri && `${containerUri}${noteStorageFileAndThingName(name)}`;
}

export function createOrUpdateNoteBody(note, value) {
  let newNote = note || createNote();
  newNote = setStringNoLocale(newNote, US.noteBody, JSON.stringify(value));
  return newNote;
}

export function createOrUpdateSlateJSON(value, note) {
  let newNote = note || createNote();
  newNote = setStringNoLocale(newNote, US.slateJSON, JSON.stringify(value));
  return newNote;
}

export async function saveNote(note, concept) {
  const noteStorageUri = concept && getUrl(concept, US.storedAt);
  return await saveThing(noteStorageUri, note);
}
