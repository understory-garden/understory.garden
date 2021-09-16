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

/*
Design:
This file is the model for the Index, formerly called the Concepts Index.

With the addition of Links and Images to the Index, it no longer behaves
exclusively as an Index for Concepts, though it does still deal primarily with
SKOS:Concepts.

For now, the Index file will still be serialized to
{Storage}/concepts.ttl to maintain simplicifty.

I am going to try something a bit experimental here,
using existing ontologies rather than inventing our own.
This model file will try storing data using the SKOS, DCT, FOAF ontologies.  

An Image will be stored as a url with the foaf.Image type.
A File will be stored as a url with the foaf.Document type.
Any url without a known type in the concepts index will be treated as a Link.

SKOS:Concept can refer to unnamed things and a label can be set later. However,
unless the user has explicityly created an unnamed Concept, we should not create
one for them. Instead, use MYSKOS:Bookmark, which is intended to represent
Bookmarked resources that might eventually be attached to a Concept, but are not
yet. An SKOS:Concept can be linked to a Bookmarked resource by using the
associated 'SKOS:note' and 'FOAF:page'. The semantics of both the `note`
predicate FOAF:Document type specify that they can (and should) be used for
Image content as well. Given that the definition of Document / note is so broad,
we will likely need to write our own SOKS extension library to add additional
specificity.

Tags and Mentions will be implemented as SKOS-XL:Labels (with the appropriate
'@' or '#' included in the label string).  Mentions should also be linked to an
FOAF:Person record, as they include additional semantices beyong just labeling.
This allows us to maintain Label Things to represent Tags and Mentions
independanlty of Concepts.  Mutiple labels can be set on a Concept, and
SKOS-XL:Labels can be easily reset on mutiple Concepts. Neither a Tag nor a
Mention shoudl be set at the prefLabel for a particular Concept.

DCTERMS:format should be used as a property to indicate the format of a resource.
As reccomended by the DCTERMS documentation, we use mime types:
https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types

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
