import {
  createThing,
  buildThing,
  setThing,
  SolidDataset,
  createSolidDataset,
} from "@inrupt/solid-client";
import { SKOS, RDF, FOAF, DCT } from "@inrupt/vocab-common-rdf";

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

SKOS:Concept can refer to unnamed things and a label can be set later.  To make
querying easier, everything will be represented as SKOS:Concepts with associated
'SKOS:note' and 'FOAF:page' properties linking that Concept to a particular note
or page. The semantics of both the `note` predicate FOAF:Document type specify
that they can (and should) be used for Image content as well. Given that the
definition of Document / note is so broad, we will likely need to write our own
SOKS extension library to add additional specificity.

Tags and Mentions will be implemented as SKOS-XL:Labels (with the appropriate
'@' or '#' included in the label string).  Mentions should also be linked to an
FOAF:Person record, as they include additional semantices beyong just labeling.
This allows us to maintain Label Things to represent Tags and Mentions
independanlty of Concepts.  Mutiple labels can be set on a Concept, and
SKOS-XL:Labels can be easily reset on mutiple Concepts. Neither a Tag nor a
Mention shoudl be set at the prefLabel for a particular Concept.
*/

export function getAllLinks(index: SolidDataset): []Thing {
  return getAllConcepts(index).filter(({ sub }) => subject.value )
}

export function getAllImages(index: SolidDataset): []Thing {}
export function getAllFiles(index: SolidDataset): []Thing {
  return Array.from(
    index.match(null, namedNode(RDF.type), namedNode(FOAF.Document))
  ).map(({ subject }) => createThing({ url: subject.value }));
}

export function addLinkToIndex(index: SolidDataset, url: string): SolidDataset {
  const LinkThing = createThing({ url });
  return setThing(index || createSolidDataset(), LinkThing);
}

export function addImageToIndex(
  index: SolidDataset,
  url: string
): SolidDataset {
  const ImageThing = buildThing(createThing({ url }))
    .addUrl(RDF.type, FOAF.Image)
    .build();

  return setThing(index || createSolidDataset(), ImageThing);
}

export function addFileToIndex(index: SolidDataset, url: string): SolidDataset {
  const FileThing = buildThing(createThing({ url }))
    .addUrl(RDF.type, FOAF.Document)
    .build();

  return setThing(index || createSolidDataset(), FileThing);
}
