import {
  useMemo,
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useRef,
} from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ReactEditor } from "slate-react";
import { useWebId, useThing, useAuthentication, useProfile } from "swrlit";
import {
  setStringNoLocale,
  getStringNoLocale,
  setThing,
  createSolidDataset,
  getUrlAll,
  removeThing,
  getUrl,
  setUrl,
} from "@inrupt/solid-client";
import { namedNode } from "@rdfjs/dataset";
import { FOAF } from "@inrupt/vocab-common-rdf";
import { Transition } from "@headlessui/react";
import { useDebounce } from "use-debounce";

import PlateEditor from "../components/Plate/Editor";
import { EmptySlateJSON } from "../utils/slate";
import {
  useStoreEditorValue,
  useStoreEditorState,
  usePlateActions,
} from "@udecode/plate";

import Nav from "./nav";

import NoteContext from "../contexts/NoteContext";
import { useWorkspaceContext } from "../contexts/WorkspaceContext";

import {
  useConceptIndex,
  useCombinedConceptIndex,
  useConcept,
} from "../hooks/concepts";
import { useWorkspace, useCurrentWorkspace } from "../hooks/app";

import {
  publicNotePath,
  privateNotePath,
  profilePath,
  urlSafeIdToConceptName,
} from "../utils/uris";
import { deleteResource } from "../utils/fetch";
import { noteBodyToSlateJSON } from "../utils/slate";
import {
  createOrUpdateConceptIndex,
  conceptIdFromUri,
  conceptUrisThatReference,
} from "../model/concept";
import {
  createNote,
  createOrUpdateNote,
  noteStorageFileAndThingName,
} from "../model/note";
import { US } from "../vocab";

import { useConceptAutocomplete } from "../hooks/editor";

import WebMonetization from "../components/WebMonetization";
import { Loader, Portal } from "../components/elements";

function LinkToConcept({ uri, ...props }) {
  const id = conceptIdFromUri(uri);
  const name = urlSafeIdToConceptName(id);
  const { path } = useContext(NoteContext);
  return (
    <Link href={`${path}/${id}`}>
      <a className="text-blue-500 underline">[[{name}]]</a>
    </Link>
  );
}

function LinksTo({ name }) {
  const webId = useWebId();
  const { slug: workspaceSlug } = useWorkspaceContext();
  const { concept } = useConcept(webId, workspaceSlug, name);
  const conceptUris = concept && getUrlAll(concept, US.refersTo);
  return (
    <ul>
      {conceptUris &&
        conceptUris.map((uri) => (
          <li key={uri}>
            <LinkToConcept uri={uri} />
          </li>
        ))}
    </ul>
  );
}

function LinksFrom({ conceptUri }) {
  const webId = useWebId();
  const { slug: workspaceSlug } = useWorkspaceContext();
  const { index } = useCombinedConceptIndex(webId, workspaceSlug);
  const linkingConcepts = index.match(
    null,
    namedNode(US.refersTo),
    namedNode(conceptUri)
  );
  return (
    <ul>
      {conceptUrisThatReference(index, conceptUri).map((uri) => (
        <li key={uri}>
          <LinkToConcept uri={uri} />
        </li>
      ))}
    </ul>
  );
}

function PrivacyControl({ name, ...rest }) {
  const [saving, setSaving] = useState(false);
  const webId = useWebId();
  const { slug: workspaceSlug } = useWorkspaceContext();
  const { concept } = useConcept(webId, workspaceSlug, name);
  const { index: privateIndex, save: savePrivateIndex } = useConceptIndex(
    webId,
    workspaceSlug,
    "private"
  );
  const { index: publicIndex, save: savePublicIndex } = useConceptIndex(
    webId,
    workspaceSlug,
    "public"
  );
  const { workspace: privateStorage } = useWorkspace(
    webId,
    workspaceSlug,
    "private"
  );
  const { workspace: publicStorage } = useWorkspace(
    webId,
    workspaceSlug,
    "public"
  );

  const publicNoteResourceUrl =
    publicStorage &&
    name &&
    `${getUrl(publicStorage, US.noteStorage)}${noteStorageFileAndThingName(
      name
    )}`;
  const { thing: publicNote, save: savePublic } = useThing(
    publicNoteResourceUrl
  );

  const privateNoteResourceUrl =
    privateStorage &&
    name &&
    `${getUrl(privateStorage, US.noteStorage)}${noteStorageFileAndThingName(
      name
    )}`;
  const { thing: privateNote, save: savePrivate } = useThing(
    privateNoteResourceUrl
  );

  async function makePrivateCallback() {
    setSaving(true);
    await savePrivate(
      setStringNoLocale(
        privateNote || createNote(),
        US.noteBody,
        getStringNoLocale(publicNote, US.noteBody)
      )
    );
    await savePrivateIndex(
      setThing(
        privateIndex || createSolidDataset(),
        setUrl(concept, US.storedAt, privateNoteResourceUrl)
      )
    );
    await savePublicIndex(
      removeThing(publicIndex || createSolidDataset(), concept)
    );
    await deleteResource(publicNoteResourceUrl);
    setSaving(false);
  }
  async function makePublicCallback() {
    setSaving(true);
    await savePublic(
      setStringNoLocale(
        publicNote || createNote(),
        US.noteBody,
        getStringNoLocale(privateNote, US.noteBody)
      )
    );
    await savePublicIndex(
      setThing(
        publicIndex || createSolidDataset(),
        setUrl(concept, US.storedAt, publicNoteResourceUrl)
      )
    );
    await savePrivateIndex(
      removeThing(privateIndex || createSolidDataset(), concept)
    );
    await deleteResource(privateNoteResourceUrl);
    setSaving(false);
  }
  return concept && !saving ? (
    getUrl(concept, US.storedAt) === publicNoteResourceUrl ? (
      <button className="btn" onClick={makePrivateCallback} {...rest}>
        make private
      </button>
    ) : getUrl(concept, US.storedAt) === privateNoteResourceUrl ? (
      <button className="btn" onClick={makePublicCallback} {...rest}>
        make public
      </button>
    ) : (
      <span>bad storage url: {getUrl(concept, US.storedAt)}</span>
    )
  ) : (
    <Loader />
  );
}

export default function NotePage({
  encodedName,
  webId,
  path = "/notes",
  readOnly = false,
}) {
  const name = encodedName && urlSafeIdToConceptName(encodedName);
  const myWebId = useWebId();
  const { workspace, slug: workspaceSlug } = useCurrentWorkspace();
  const {
    conceptUri,
    concept,
    index: conceptIndex,
    saveIndex: saveConceptIndex,
  } = useConcept(webId, workspaceSlug, name);

  const noteStorageUri = concept && getUrl(concept, US.storedAt);

  const {
    error,
    thing: note,
    save,
    mutate: mutateNote,
  } = useThing(noteStorageUri);
  const bodyJSON = note && getStringNoLocale(note, US.noteBody);
  const slateJSON = note && getStringNoLocale(note, US.slateJSON);
  const body =
    (slateJSON && JSON.parse(slateJSON)) ||
    (bodyJSON && noteBodyToSlateJSON(JSON.parse(bodyJSON)));
  const [showPrivacy, setShowPrivacy] = useState(false);
  const errorStatus = error && error.statusCode;

  const editorId = "note-page";
  const value = useStoreEditorValue(editorId);
  const editor = useStoreEditorState(editorId);
  const { setValue, resetEditor } = usePlateActions(editorId);

  const [debouncedValue] = useDebounce(value, 1500);
  const [saving, setSaving] = useState(false);
  const saved = value === undefined || body === value;

  useEffect(
    function setValueFromNote() {
      if (body) {
        setValue(body);
      } else if (errorStatus == 404) {
        setValue(EmptySlateJSON);
      }
    },
    [body, errorStatus]
  );

  const { profile: authorProfile } = useProfile(webId);
  const authorName =
    authorProfile && getStringNoLocale(authorProfile, FOAF.name);

  const saveCallback = async function saveNote() {
    const newNote = createOrUpdateNoteBody(note, value);
    const newConceptIndex = createOrUpdateConceptIndex(
      editor,
      workspace,
      conceptIndex,
      concept,
      name
    );
    setSaving(true);
    try {
      await save(newNote);
      await saveConceptIndex(newConceptIndex);
    } catch (e) {
      console.log("error saving note", e);
    } finally {
      setSaving(false);
    }
  };
  useEffect(
    function saveAfterDebounce() {
      if (debouncedValue) {
        const isInitialNoteState =
          debouncedValue === EmptySlateJSON && body === undefined;
        if (
          JSON.stringify(debouncedValue) !== bodyJSON &&
          !isInitialNoteState
        ) {
          saveCallback();
        }
      }
    },
    [debouncedValue]
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { fetch } = useAuthentication();
  const router = useRouter();
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (url !== window.location.pathname) {
        resetEditor();
      }
    };
    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, []);
  async function deleteCallback() {
    if (confirm(`Are you sure you want to delete ${name} ?`)) {
      await Promise.all([
        fetch(noteStorageUri, { method: "DELETE" }),
        concept && saveConceptIndex(removeThing(conceptIndex, concept)),
      ]);
      // mutate to invalidate the cache for the note
      mutateNote();

      router.push("/");
    }
  }

  const coverImage = note && getUrl(note, FOAF.img);
  const noteContext = useMemo(
    () => ({ path: `${path}/${workspaceSlug}`, note, save }),
    [path, workspaceSlug, note, save]
  );

  return (
    <NoteContext.Provider value={noteContext}>
      <div className="flex flex-col page">
        <WebMonetization webId={webId} />
        <Nav />
        <div className="relative overflow-y-hidden flex-none h-56">
          {coverImage && <img className="w-full" src={coverImage} />}
          <div className="absolute top-0 left-0 w-full p-6 flex flex-col justify-between">
            <div className="flex flex-row justify-between h-44 overflow-y-hidden">
              <div className="flex flex-col">
                <h1 className="text-5xl font-bold text-gray-800">{name}</h1>
                {authorName && (
                  <div className="text-lg text-gray-800">
                    by&nbsp;
                    <Link href={profilePath(webId) || ""}>
                      <a>{authorName}</a>
                    </Link>
                  </div>
                )}
              </div>
              {name &&
                (readOnly ? (
                  myWebId === webId && (
                    <Link href={privateNotePath(workspaceSlug, name) || ""}>
                      <a>edit</a>
                    </Link>
                  )
                ) : (
                  <Link href={publicNotePath(webId, workspaceSlug, name) || ""}>
                    <a>sharable link</a>
                  </Link>
                ))}
              {!readOnly && (
                <div className="flex flex-col">
                  <button
                    className="btn"
                    onClick={() => setShowPrivacy(!showPrivacy)}
                  >
                    {showPrivacy ? "hide" : "show"} privacy control
                  </button>
                  <button className="btn" onClick={deleteCallback}>
                    delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {showPrivacy && <PrivacyControl name={name} />}
        <section
          className="relative w-full flex flex-grow"
          aria-labelledby="slide-over-heading"
        >
          <div className="w-full flex flex-col flex-grow">
            {body !== undefined ? (
              <PlateEditor editorId={editorId} initialValue={body} />
            ) : (
              <Loader />
            )}
          </div>
        </section>
      </div>
    </NoteContext.Provider>
  );
}
