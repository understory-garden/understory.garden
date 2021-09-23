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
import { SKOS, RDF, FOAF, DCTERMS, OWL } from "@inrupt/vocab-common-rdf";
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

export function addBookmarkToIndex(
  index: SolidDataset,
  url: string
): SolidDataset {
  const BookmarkThing = buildThing(createThing())
    .addUrl(RDF.type, MY.SKOS.Bookmark)
    // .addUrl(MY.SKOS.prefImage, imgUrl)
    .addUrl(FOAF.focus, url)
    .build();

  return setThing(index || createSolidDataset(), BookmarkThing);
}

export function addImageToIndex(
  index: SolidDataset,
  url: string
): SolidDataset {
  const ImageThing = buildThing(createThing({ url }))
    .addUrl(RDF.type, FOAF.Image)
    // TODO:     .addStringNoLocale(DCTERMS.format, ...)
    // TODO:    FOAF.depiction
    .build();

  return setThing(index || createSolidDataset(), ImageThing);
}

// DO NOT USE -- only a prototype for how we might store Contacts
function _addPersonToIndex(
  index: SolidDataset,
  handle: string,
  name: string,
  webId: WebId
): SolidDataset {
  const PersonThing = buildThing(
    createThing({ name: `PERSON:base58:${base58.encode(handle)}` })
  )
    .addUrl(RDF.type, FOAF.Person)
    .addUrl(OWL.sameAs, webId)
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
    createThing({ name: `CONCEPT:base58:${base58.encode(name)}` })
  )
    .addUrl(RDF.type, SKOS.Concept)
    .addStringNoLocale(SKOS.prefLabel, name)
    // .addUrl(SKOS.note, noteUrl)
    // .addUrl(MY.SKOS.prefImage, imgUrl)
    // .addUrl(FOAF.depiction, imgUrl)
    // .addStringNoLocale(SCHEMA_INRUPT.description, imgUrl)
    // .addUrl(FOAF.focus, someIRI)
    .build();

  return setThing(index || createSolidDataset(), ConceptThing);
}

// DO NOT USE -- only a prototype for how we might uaw SKOS for Collections
function _addCollectionToIndex(index: SolidDataset, name: string) {
  const ConceptThing = buildThing(
    // NOTE: This will not work if we move the concept.
    createThing({ name: `COLLECTION:base58:${base58.encode(name)}` })
  )
    .addUrl(RDF.type, SKOS.Collection)
    .addStringNoLocale(SKOS.prefLabel, name)
    // ...
    .build();

  return setThing(index || createSolidDataset(), ConceptThing);
}

export type IRI = string;
export type Tag = string;
export type Mention = string;
export type WebId = IRI;
export type Image = IRI;
export type File = IRI;
export type Link = IRI;
export type PlateEditorValue = JSON;

export type Note = {
  iri: IRI;
  body: PlateEditorValue;
};

export type Concept = {
  iri: IRI; // https://www.w3.org/TR/rdf11-concepts/#section-IRIs
  prefImage?: Image; // cover image
  description?: string; // preview text
  focus?: IRI; // the main focus of the Concept
  name: string;
  note: IRI; // main content
  related: IRI[];
  tagged: Tag[];
  mentioned: Mention[];
};

export type Bookmark = {
  iri: IRI;
  prefImage?: Image;
  description?: Image;
  focus: IRI;
};

export type Person = {
  iri: IRI;
  webId: WebId;
  handle: string;
  name: string;
};
