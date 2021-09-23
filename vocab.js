export const PP = {
  paymentPointer: "http://paymentpointers.org/ns#PaymentPointer",
};

const understoryRoot = "https://understory.coop/vocab/garden#";
export const US = {
  noteBody: `${understoryRoot}noteBody`,
  refersTo: `${understoryRoot}refersTo`,
  paymentPointer: `${understoryRoot}paymentPointer`,
  storedAt: `${understoryRoot}storedAt`,
  noteStorage: `${understoryRoot}noteStorage`,
  publicPrefs: `${understoryRoot}publicPrefs`,
  privatePrefs: `${understoryRoot}privatePrefs`,
  backupsStorage: `${understoryRoot}backupsStorage`,
  hasWorkspace: `${understoryRoot}hasWorkspace`,
  conceptIndex: `${understoryRoot}conceptIndex`,
  conceptPrefix: `${understoryRoot}conceptPrefix`,
  tagged: `${understoryRoot}tagged`,
  tagPrefix: `${understoryRoot}tagPrefix`,
  hasSettings: `${understoryRoot}hasSettings`,
  devMode: `${understoryRoot}devMode`,
  hasGnomeType: `${understoryRoot}hasGnomeType`,
  usesGateTemplate: `${understoryRoot}usesGateTemplate`,
  usesConcept: `${understoryRoot}usesConcept`,
  usesConceptIndex: `${understoryRoot}usesConceptIndex`,
  deployedAt: `${understoryRoot}deployedAt`,
  hasGnomeStatus: `${understoryRoot}hasGnomeStatus`,
  monetizedFor: `${understoryRoot}monetizedFor`,
  usesCSS: `${understoryRoot}usesCSS`,
  slateJSON: `${understoryRoot}slateJSON`, // https://docs.slatejs.org/concepts/02-nodes
};

const MY_PREFIX = "https://vocab.mysilio.com/my/";
const MY_SKOS = `${MY_PREFIX}skos#`;
const MY_FOAF = `${MY_PREFIX}foaf#`;
export const MY = {
  SKOS: {
    Bookmark: `${MY_SKOS}Bookmark`, // disjoint with SKOS:Concept. Concepts and Bookmarks can both point to the same notes / resources, but a Bookmark is explicitly defined as a "Concept Fragmet" rather than a full Concept.
    prefImage: `${MY_SKOS}prefImage`, //  should have no more than 1 value per resource, similar to SKOS:prefLabel, but references an FOAF:Image.
    altImage: `${MY_SKOS}altImage`, // similar to SKOS:altLabel, but references an FOAF:Image
    Tag: `${MY_SKOS}Tag`, // a subclass of SKOS-XL:Label
    mentioned: `${MY_SKOS}mentioned`, // subclass of SKOS:semanticRelation
    tagged: `${MY_SKOS}tagged`, // subclass of SKOS:semanticRelation`
  },
};

export const MIME = {
  html: "text/html",
  gif: "image/gif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  webp: "image/webp",
};
