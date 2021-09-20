import { US } from "../vocab";
import { namedNode } from "@rdfjs/dataset";
import {
  createThing,
  addUrl,
  setThing,
  createSolidDataset,
  setDatetime,
  getDatetime,
  getUrl,
} from "@inrupt/solid-client";
import { DCTERMS } from "@inrupt/vocab-common-rdf";
import {
  getConceptNodes,
  getConceptNameFromNode,
  getTagNodes,
  getTagNameFromNode,
} from "../utils/slate";
import {
  conceptNameToUrlSafeId,
  urlSafeIdToConceptName,
  tagNameToUrlSafeId,
} from "../utils/uris";
import { defaultNoteStorageUri } from "./note";

export function conceptIdFromUri(uri) {
  return uri.substring(uri.lastIndexOf("#") + 1);
}

export function conceptNameFromUri(uri) {
  return urlSafeIdToConceptName(conceptIdFromUri(uri));
}

export function conceptUrisThatReference(index, conceptUri) {
  return Array.from(
    index.match(null, namedNode(US.refersTo), namedNode(conceptUri))
  ).map(({ subject }) => subject.value);
}

export function conceptUrisTaggedWith(index, tagUri) {
  return Array.from(
    index.match(null, namedNode(US.tagged), namedNode(tagUri))
  ).map(({ subject }) => subject.value);
}

function createConcept(prefix, name) {
  return createThing({ url: `${prefix}${conceptNameToUrlSafeId(name)}` });
}

function createTag(prefix, name) {
  return createThing({ url: `${prefix}${tagNameToUrlSafeId(name)}` });
}

function createConceptFor(
  name,
  conceptPrefix,
  conceptNames,
  tagPrefix,
  tagNames
) {
  let concept = createConcept(conceptPrefix, name);
  for (const conceptName of conceptNames) {
    concept = addUrl(
      concept,
      US.refersTo,
      createConcept(conceptPrefix, conceptName)
    );
  }
  for (const tagName of tagNames) {
    concept = addUrl(concept, US.tagged, createTag(tagPrefix, tagName));
  }
  return concept;
}

export function createOrUpdateConceptIndex(
  editor,
  workspace,
  conceptIndex,
  concept,
  name
) {
  const conceptPrefix = getUrl(workspace, US.conceptPrefix);
  const tagPrefix = getUrl(workspace, US.tagPrefix);
  const storageUri = concept
    ? getUrl(concept, US.storedAt)
    : defaultNoteStorageUri(workspace, name);

  const conceptNames = getConceptNodes(editor).map(([concept]) =>
    getConceptNameFromNode(concept)
  );
  const tagNames = getTagNodes(editor).map(([tag]) => getTagNameFromNode(tag));
  const created = getDatetime(concept, DCTERMS.created) || new Date();
  let newConcept = createConceptFor(
    name,
    conceptPrefix,
    conceptNames,
    tagPrefix,
    tagNames
  );
  newConcept = addUrl(newConcept, US.storedAt, storageUri);
  newConcept = setDatetime(newConcept, DCTERMS.modified, new Date());
  newConcept = setDatetime(newConcept, DCTERMS.created, created);
  return setThing(conceptIndex || createSolidDataset(), newConcept);
}
