import { useState, useCallback } from "react";

import { useRouter } from "next/router";

import { useConceptNamesMatching } from "../hooks/concepts";
import { conceptNameToUrlSafeId } from "../utils/uris";

export default function NotePicker({ onSubmit, initialSelectedName = "" }) {
  const router = useRouter();
  const [displayedName, setDisplayedName] = useState(initialSelectedName);
  const gotoNote = useCallback(
    (noteName) => {
      router.push(`/notes/default/${conceptNameToUrlSafeId(noteName)}`);
      setDisplayedName("");
    },
    [router]
  );
  const onSelectNote = (note) => {
    if (onSubmit) {
      onSubmit(selectedNote);
    } else {
      gotoNote(selectedNote);
    }
  };

  const [selectionIndex, setSelectionIndex] = useState(0);
  const matchingConceptNames = useConceptNamesMatching(displayedName);
  const onKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          const prevIndex =
            selectionIndex >= matchingConceptNames.length
              ? 0
              : selectionIndex + 1;
          setSelectionIndex(prevIndex);
          break;
        case "ArrowUp":
          event.preventDefault();
          const nextIndex =
            selectionIndex <= 0
              ? matchingConceptNames.length
              : selectionIndex - 1;
          setSelectionIndex(nextIndex);
          break;
        case "Enter":
          event.preventDefault();
          const targetNote =
            selectionIndex > 0
              ? matchingConceptNames[selectionIndex - 1]
              : event.target.value;
          onSelectNote(targetNote);
          setDisplayedName("");
          break;
      }
    },
    [matchingConceptNames, selectionIndex]
  );

  const selectedNote =
    matchingConceptNames && selectionIndex > 0
      ? matchingConceptNames[selectionIndex - 1]
      : displayedName;
  const onClick = useCallback(() => {
    onSelectNote(selectedNote);
  }, [selectedNote, onSubmit]);
  return (
    <div className="flex flex-row max-h-9 self-center">
      <div className="relative overflow-y-visible">
        <input
          value={displayedName}
          onChange={(e) => setDisplayedName(e.target.value)}
          onKeyDown={onKeyDown}
          className="rounded-xl focus:outline-none focus:border-lagoon focus:ring-2 focus:ring-lagoon mr-3 max-h-8"
          type="text"
          placeholder="Search"
        />
        <ul
          className="z-30 origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          {matchingConceptNames &&
            matchingConceptNames.map((name, i) => (
              <li
                key={name}
                onClick={() => setSelectionIndex(i + 1)}
                className={`m-1 p-1 ${
                  selectionIndex - 1 === i ? "bg-purple-500 text-white" : ""
                }`}
              >
                {name}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
