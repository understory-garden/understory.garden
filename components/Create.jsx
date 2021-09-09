import ReactModal from "react-modal";
import PlateEditor from "../components/Plate/Editor";
import { useState } from "react";
import {
  useStoreEditorValue,
  useStoreEditorState,
  usePlateActions,
} from "@udecode/plate";
import { EmptySlateJSON } from "../utils/slate";
import { useWebId, useThing } from "swrlit";
import { getUrl, isThingLocal } from "@inrupt/solid-client";

import { createOrUpdateSlateJSON, saveNote } from "../model/note";
import { createOrUpdateConceptIndex } from "../model/concept";
import { useWorkspace, useCurrentWorkspace } from "../hooks/app";
import { useConcept } from "../hooks/concepts";

export function CreateModal({ isOpen, closeModal }) {
  const [createAnother, setCreateAnother] = useState(false);
  const [saving, setSaving] = useState(false);
  const editorId = "create-modal";
  const value = useStoreEditorValue(editorId);
  const editor = useStoreEditorState(editorId);
  const { setValue, resetEditor } = usePlateActions(editorId);

  const webId = useWebId();
  const { workspace, slug: workspaceSlug } = useCurrentWorkspace();
  const [name, setName] = useState("");

  const {
    conceptUri,
    concept,
    index: conceptIndex,
    saveIndex: saveConceptIndex,
  } = useConcept(webId, workspaceSlug, name);

  const conceptExists = concept && !isThingLocal(concept);

  const save = async function save() {
    console.log("name: ", name);
    console.log("slateJSON: ", value);
    const newNote = createOrUpdateSlateJSON(value);
    const newConceptIndex = createOrUpdateConceptIndex(
      editor,
      workspace,
      conceptIndex,
      concept,
      name
    );
    setSaving(true);
    try {
      await saveConceptIndex(newConceptIndex);
      await saveNote(newNote, concept);
    } catch (e) {
      console.log("error saving note", e);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setName("");
    setValue(EmptySlateJSON);
    resetEditor();
  };

  const close = () => {
    reset();
    closeModal();
  };

  const onSubmit = () => {
    save();
    if (createAnother) {
      reset();
    } else {
      close();
    }
  };

  return (
    <ReactModal isOpen={isOpen}>
      <form className="w-full max-w-sm">
        <div
          className={`flex items-center border-b-2 py-2 ${
            conceptExists
              ? "border-ember text-ember"
              : "border-lagoon text-lagoon"
          }`}
        >
          <input
            className="appearance-none focus:ring-0 text-3xl bg-transparent outline-none border-none focus:border-none w-full mr-3 py-1 px-2 leading-tight focus:outline-none"
            type="text"
            placeholder="Untitled"
            aria-label="Concept Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {conceptExists ? (
            <span className="whitespace-nowrap">concept already exists</span>
          ) : (
            <></>
          )}
        </div>

        <div className="text-left p-4">
          <PlateEditor editorId={editorId} initialValue={value} />
        </div>

        <div className="flex justify-end border-t-2 border-echeveria py-2">
          <label className="inline-flex items-center">
            <input
              className="form-checkbox text-echeveria"
              type="checkbox"
              checked={createAnother}
              onChange={(e) => setCreateAnother(e.target.checked)}
            />
            <span className="mx-2">Create another</span>
          </label>
          <button
            type="button"
            disabled={conceptExists || saving || !concept}
            className={`btn ${saving ? "cursor-wait" : ""}`}
            onClick={onSubmit}
          >
            Create
          </button>
          <button type="button" className="btn cancel" onClick={close}>
            Cancel
          </button>
        </div>
      </form>
    </ReactModal>
  );
}

export function CreateButton() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-row max-h-9 self-center">
      <button className="flex btn" onClick={() => setModalOpen(true)}>
        Create
      </button>
      <CreateModal isOpen={modalOpen} closeModal={() => setModalOpen(false)} />
    </div>
  );
}
