import { namedNode, dataset } from "@rdfjs/dataset";
import type { DatasetCore } from "@rdfjs/types";
import {
  Thing,
  SolidDataset,
  createThing,
  buildThing,
  setThing,
  getThing,
  createSolidDataset,
} from "@inrupt/solid-client";
import { MY, MIME } from "../vocab";
import { SKOS, RDF, FOAF, DCTERMS } from "@inrupt/vocab-common-rdf";
import * as base58 from "micro-base58";

/*
Design:
This file is the model for the Index, formerly called the Concepts Index.

With the addition of Links and Images to the Index, it no longer behaves
exclusively as an Index for Concepts, though it does still deal primarily with
SKOS:Concepts.

For now, the Index file will still be serialized to
{Storage}/concepts.ttl to maintain simplicifty.

I am going to try something a bit experimental here, using existing ontologies
as much as possible rather than inventing our own.  This model file will try
storing and indexing data using the SKOS, DCTERMS, and FOAF ontologies.  

An Image will be stored as a url with the FOAF.Image type.
A File will be stored as a url with the MY.FOAF.File type from the MY.FOAF extension.
A Link will be stored as a url with the MY.FOAF.Link type from the MY.FOAF extension.

SKOS:Concept can refer to unnamed things and a label can be set later. However,
unless the user has explicityly created an unnamed Concept, we should not create
one for them. Instead, use the MY.SKOS.Bookmark type from the MY.SKOS extension,
which is intended to represent Bookmarked resources that might eventually be
attached to a Concept, but are not yet.

An SKOS.Concept can be linked to a Bookmarked resource by using the associated
SKOS.note and FOAF.page properties. The semantics of both SKOS.note and FOAF.Document
specify that they can (and should) be used for all content, including Images.
Please rememember to add additional format information using DCTERMS.format.  As
reccomended by the DCTERMS documentation, we use mime types:
https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types</DCTERMS>

Tags and Mentions will be implemented as SKOS_XL.Label (with the appropriate
'@' or '#' included in the label string).  Mentions should also be linked to an
FOAF:Person record, as they include additional semantices beyong just labeling.
This allows us to maintain Label Things to represent Tags and Mentions
independanlty of Concepts and Bookmarks.  Mutiple Labels can be set on a Concept, and
SKOS_XL.Label can be easily reset on mutiple Concepts. Neither a Tag nor a
Mention shoudl be set at the prefLabel for a particular Concept.
*/

// This is a temporary hack. We create a DatasetCore from a SolidDataset, and
// the Inrupt libraries seems to know what to do with it. So define this type to
// the TS happy. But this is a brittle assumption that may break later.
type SolidDatasetCore = SolidDataset & DatasetCore;

export function getAllLinks(index: SolidDatasetCore): Thing[] {
  return Array.from(
    index
      .match(null, namedNode(RDF.type), namedNode(MY.SKOS.Bookmark))
      .match(null, namedNode(RDF.type), namedNode(FOAF.Link))
  ).map(({ subject }) => getThing(index, subject.value));
}

export function getAllImages(index: SolidDatasetCore): Thing[] {
  return Array.from(
    index
      .match(null, namedNode(RDF.type), namedNode(MY.SKOS.Bookmark))
      .match(null, namedNode(RDF.type), namedNode(FOAF.Image))
  ).map(({ subject }) => getThing(index, subject.value));
}
export function getAllFiles(index: SolidDatasetCore): Thing[] {
  return Array.from(
    index
      .match(null, namedNode(RDF.type), namedNode(MY.SKOS.Bookmark))
      .match(null, namedNode(RDF.type), namedNode(MY.FOAF.File))
  ).map(({ subject }) => getThing(index, subject.value));
}

export function addLinkToIndex(index: SolidDataset, url: string): SolidDataset {
  const LinkThing = buildThing(createThing({ url }))
    .addUrl(RDF.type, MY.SKOS.Bookmark)
    .addUrl(RDF.type, MY.FOAF.Link)
    .addStringNoLocale(DCTERMS.format, MIME.html)
    .build();
  return setThing(index || createSolidDataset(), LinkThing);
}

export function addImageToIndex(
  index: SolidDataset,
  url: string
): SolidDataset {
  const ImageThing = buildThing(createThing({ url }))
    .addUrl(RDF.type, MY.SKOS.Bookmark)
    .addUrl(RDF.type, FOAF.Image)
    // TODO:     .addStringNoLocale(DCTERMS.format, ...)
    .build();

  return setThing(index || createSolidDataset(), ImageThing);
}

export function addFileToIndex(index: SolidDataset, url: string): SolidDataset {
  const FileThing = buildThing(createThing({ url }))
    .addUrl(RDF.type, MY.SKOS.Bookmark)
    .addUrl(RDF.type, MY.FOAF.File)
    // TODO:     .addStringNoLocale(DCTERMS.format, ...)
    .build();

  return setThing(index || createSolidDataset(), FileThing);
}

export function addTagToIndex(index: SolidDataset, tag: string): SolidDataset {
  const TagThing = buildThing(
    createThing({ name: `TAG:base58:${base58.encode(tag)}` })
  )
    .addUrl(RDF.type, SKOS.Label)
    .addUrl(RDF.type, MY.SKOS.Tag)
    .addStringNoLocale(SKOS.prefLabel, tag)
    // TODO:     .addStringNoLocale(DCTERMS.format, ...)
    .build();

  return setThing(index || createSolidDataset(), TagThing);
}

export function addMentionToIndex(
  index: SolidDataset,
  handle: string
): SolidDataset {
  const MentionThing = buildThing(
    createThing({ name: `MENTION:base58:${base58.encode(handle)}` })
  )
    .addUrl(RDF.type, SKOS.Label)
    .addUrl(RDF.type, MY.SKOS.Mention)
    .addStringNoLocale(SKOS.prefLabel, handle)
    .build();

  return setThing(index || createSolidDataset(), MentionThing);
}

// DO NOT USE -- only a prototype for how we might store Contacts
function _addPersonToIndex(
  index: SolidDataset,
  handle: string,
  name: string
): SolidDataset {
  const PersonThing = buildThing(
    createThing({ name: `PERSON:base58:${base58.encode(handle)}` })
  )
    .addUrl(RDF.type, FOAF.Person)
    .addStringNoLocale(SKOS.prefLabel, handle)
    .addStringNoLocale(FOAF.nick, handle)
    .addStringNoLocale(FOAF.name, name)
    .build();

  return setThing(index || createSolidDataset(), PersonThing);
}

// DO NOT USE -- only a prototype for how we might use SKOS for collections
function _addConceptToIndex(index: SolidDataset, name: string) {
  const ConceptThing = buildThing(
    // NOTE: This will not work if we move the concept.
    createThing({ name: `COCNEPT:base58:${base58.encode(name)}` })
  )
    .addUrl(RDF.type, SKOS.Concept)
    .addStringNoLocale(SKOS.prefLabel, name)
    // .addUrl(SKOS.note, ...)
    .build();

  return setThing(index || createSolidDataset(), ConceptThing);
}

// DO NOT USE -- only a prototype for how we might uaw SKOS for Collections
function _addCollectionToIndex(index: SolidDataset, name: string) {
  const ConceptThing = buildThing(
    // NOTE: This will not work if we move the concept.
    createThing({ name: `COCNEPT:base58:${base58.encode(name)}` })
  )
    .addUrl(RDF.type, SKOS.Collection)
    .addStringNoLocale(SKOS.prefLabel, name)
    // .addUrl(SKOS.note, ...)
    .build();

  return setThing(index || createSolidDataset(), ConceptThing);
}
