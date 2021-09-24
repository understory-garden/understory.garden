import { useContext } from "react";
import {
  setStringNoLocale,
  getStringNoLocale,
  getUrl,
  setUrl,
  createSolid,
  getThingAll,
  asUrl,
  getDatetime,
} from "@inrupt/solid-client";
import Link from "next/link";
import { DCTERMS } from "@inrupt/vocab-common-rdf";
import WorkspaceContext from "../contexts/WorkspaceContext";

import { conceptIdFromUri } from "../model/concept";
import { useConcepts } from "../hooks/concepts";
import NoteContext from "../contexts/NoteContext";
import { urlSafeIdToConceptName } from "../utils/uris";

export function Note({ concept }) {
  const uri = asUrl(concept);
  const id = conceptIdFromUri(uri);
  const name = urlSafeIdToConceptName(id);
  const { path } = useContext(NoteContext);

  return (
    <li className="col-span-1 bg-mist rounded-lg shadow overflow-x-auto">
      <Link href={`${path}/${id}`}>
        <a>
          <div className="w-full flex flex-col items-center justify-between p-6">
            <h3 className="text-lagoon text-xl font-medium truncate text-center">
              {name}
            </h3>
          </div>
        </a>
      </Link>
    </li>
  );
}

export function NotesFromConcepts({ path = "/notes", webId, concepts }) {
  const { slug: workspaceSlug } = useContext(WorkspaceContext);
  return (
    <NoteContext.Provider value={{ path: `${path}/${workspaceSlug}` }}>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {concepts &&
          concepts.map((concept) => (
            <Note key={asUrl(concept)} concept={concept} />
          ))}
      </ul>
    </NoteContext.Provider>
  );
}

export default function Notes({ path = "/notes", webId }) {
  const { concepts } = useConcepts(webId);
  return (
    <>
      {concepts && concepts.length > 0 ? (
        <NotesFromConcepts path={path} webId={webId} concepts={concepts} />
      ) : (
        <div>
          <h2 className="text-2xl mb-2">
            Add something to your garden using the Create menu above ^^
          </h2>
        </div>
      )}
    </>
  );
}
