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
  },
  FOAF: {
    File: `${MY_FOAF}File`, // subclass of Document, disjoint with Link. For resources that are intended to be downloaded as Files.
    Link: `${MY_FOAF}Link`, // subclass of Document, disjoint with File. For resources that are intended to be treated as Links / viewed in a WebBrowser
  },
};

export const MIME = {
  html: "text/html",
};
