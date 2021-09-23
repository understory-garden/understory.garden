import React, { useState, useMemo, useContext } from "react";
import * as P from "@udecode/plate";
import { useSelected, useReadOnly } from "slate-react";
import {
  ToolbarButtonsList,
  ToolbarButtonsBasicElements,
  BallonToolbarMarks,
} from "./Toolbars";
import { Image as ImageIcon } from "@styled-icons/material/Image";
import { Link as LinkIcon } from "@styled-icons/material/Link";
import Link from "next/link";
import { Portal } from "../../components/elements";

import { useCurrentWorkspace } from "../../hooks/app";
import { useConcepts } from "../../hooks/concepts";
import { useWebId } from "swrlit";

import { asUrl } from "@inrupt/solid-client";
import {
  urlSafeIdToConceptName,
  conceptNameToUrlSafeId,
} from "../../utils/uris";
import { ELEMENT_CONCEPT, ELEMENT_TAG } from "../../utils/slate";
import { conceptIdFromUri } from "../../model/concept";
import {
  useCustomMentionPlugin,
  Patterns,
  toMentionable,
  fromMentionable,
} from "./hooks/useCustomMentionPlugin";
import NoteContext from "../../contexts/NoteContext";

const ConceptElement = (m) => {
  const name = fromMentionable(m);
  const { path } = useContext(NoteContext);
  const id = conceptNameToUrlSafeId(name);
  return (
    <Link href={`${path}/${id}`}>
      <a className="text-lagoon">[[{name}]]</a>
    </Link>
  );
};

const TagElement = (m) => {
  const tag = fromMentionable(m);

  return <span className="text-lagoon">#{tag}</span>;
};

const MentionElement = (m) => {
  const mention = fromMentionable(m);
  return <span className="text-lagoon">@{mention}</span>;
};

const ConceptSelectLabel = (m) => {
  const name = fromMentionable(m);
  return <span className="text-lagoon">[[{name}]]</span>;
};

const TagSelectLabel = (m) => {
  const tag = fromMentionable(m);
  return <span className="text-lagoon">#{tag}</span>;
};

const MentionSelectLabel = (m) => {
  const mention = fromMentionable(m);
  return <span className="text-lagoon">@{mention}</span>;
};

const components = P.createPlateComponents({
  [P.ELEMENT_H1]: P.withProps(P.StyledElement, { as: "h1" }),
  [P.ELEMENT_H2]: P.withProps(P.StyledElement, { as: "h2" }),
  [P.ELEMENT_H3]: P.withProps(P.StyledElement, { as: "h3" }),
  [ELEMENT_CONCEPT]: P.withProps(P.MentionElement, {
    renderLabel: ConceptElement,
  }),
  [ELEMENT_TAG]: P.withProps(P.MentionElement, {
    renderLabel: TagElement,
  }),
  [P.ELEMENT_MENTION]: P.withProps(P.MentionElement, {
    renderLabel: MentionElement,
  }),
});

const defaultOptions = P.createPlateOptions();

const preFormat = (editor) => P.unwrapList(editor);

const optionsAutoformat = {
  rules: [
    {
      type: P.ELEMENT_H1,
      markup: "#",
      preFormat,
    },
    {
      type: P.ELEMENT_H2,
      markup: "##",
      preFormat,
    },
    {
      type: P.ELEMENT_H3,
      markup: "###",
      preFormat,
    },
    {
      type: P.ELEMENT_LI,
      markup: ["*", "-"],
      preFormat,
      format: (editor) => {
        if (editor.selection) {
          const parentEntry = P.getParent(editor, editor.selection);
          if (!parentEntry) return;
          const [node] = parentEntry;
          if (
            P.isElement(node) &&
            !P.isType(editor, node, P.ELEMENT_CODE_BLOCK) &&
            !P.isType(editor, node, P.ELEMENT_CODE_LINE)
          ) {
            P.toggleList(editor, {
              type: P.ELEMENT_UL,
            });
          }
        }
      },
    },
    {
      type: P.ELEMENT_LI,
      markup: ["1.", "1)"],
      preFormat,
      format: (editor) => {
        if (editor.selection) {
          const parentEntry = P.getParent(editor, editor.selection);
          if (!parentEntry) return;
          const [node] = parentEntry;
          if (
            P.isElement(node) &&
            !P.isType(editor, node, P.ELEMENT_CODE_BLOCK) &&
            !P.isType(editor, node, P.ELEMENT_CODE_LINE)
          ) {
            P.toggleList(editor, {
              type: P.ELEMENT_OL,
            });
          }
        }
      },
    },
    {
      type: P.ELEMENT_TODO_LI,
      markup: ["[]"],
    },
    {
      type: P.ELEMENT_BLOCKQUOTE,
      markup: [">"],
      preFormat,
    },
    {
      type: P.MARK_BOLD,
      between: ["**", "**"],
      mode: "inline",
      insertTrigger: true,
    },
    {
      type: P.MARK_BOLD,
      between: ["__", "__"],
      mode: "inline",
      insertTrigger: true,
    },
    {
      type: P.MARK_ITALIC,
      between: ["*", "*"],
      mode: "inline",
      insertTrigger: true,
    },
    {
      type: P.MARK_ITALIC,
      between: ["_", "_"],
      mode: "inline",
      insertTrigger: true,
    },
    {
      type: P.MARK_CODE,
      between: ["`", "`"],
      mode: "inline",
      insertTrigger: true,
    },
    {
      type: P.ELEMENT_CODE_BLOCK,
      markup: "``",
      trigger: "`",
      triggerAtBlockStart: false,
      preFormat,
      format: (editor) => {
        P.insertEmptyCodeBlock(editor, {
          defaultType: P.getPlatePluginType(editor, P.ELEMENT_DEFAULT),
          insertNodesOptions: { select: true },
        });
      },
    },
  ],
};

const resetBlockTypesCommonRule = {
  types: [P.ELEMENT_BLOCKQUOTE, P.ELEMENT_TODO_LI],
  defaultType: P.ELEMENT_PARAGRAPH,
};

const optionsResetBlockTypePlugin = {
  rules: [
    {
      ...resetBlockTypesCommonRule,
      hotkey: "Enter",
      predicate: P.isBlockAboveEmpty,
    },
    {
      ...resetBlockTypesCommonRule,
      hotkey: "Backspace",
      predicate: P.isSelectionAtBlockStart,
    },
  ],
};

/* TODO:" add mentionables for Concepts, and friends */

const defaultPlugins = [
  P.createReactPlugin(),
  P.createHistoryPlugin(),
  P.createHeadingPlugin({ levels: 3 }),
  P.createParagraphPlugin(),
  P.createBoldPlugin(),
  P.createItalicPlugin(),
  P.createUnderlinePlugin(),
  P.createCodePlugin(),
  P.createHighlightPlugin(),
  P.createBlockquotePlugin(),
  P.createCodeBlockPlugin(),
  P.createListPlugin(),
  P.createTodoListPlugin(),
  P.createImagePlugin(),
  P.createLinkPlugin(),
  P.createKbdPlugin(),
  P.createNodeIdPlugin(),
  P.createAutoformatPlugin(optionsAutoformat),
  P.createResetNodePlugin(optionsResetBlockTypePlugin),
  P.createSoftBreakPlugin({
    rules: [
      { hotkey: "shift+enter" },
      {
        hotkey: "enter",
        query: {
          allow: [P.ELEMENT_CODE_BLOCK, P.ELEMENT_BLOCKQUOTE, P.ELEMENT_TD],
        },
      },
    ],
  }),
  P.createExitBreakPlugin({
    rules: [
      {
        hotkey: "mod+enter",
      },
      {
        hotkey: "mod+shift+enter",
        before: true,
      },
      {
        hotkey: "enter",
        query: {
          start: true,
          end: true,
          allow: P.KEYS_HEADING,
        },
      },
    ],
  }),
  P.createSelectOnBackspacePlugin({ allow: P.ELEMENT_IMAGE }),
];

export default function Editor({
  editorId = "default-plate-editor",
  initialValue = "",
  onChange,
}) {
  const webId = useWebId();
  const { concepts } = useConcepts(webId);
  const { workspace, slug: workspaceSlug } = useCurrentWorkspace();

  const editableProps = {
    placeholder: "What's on your mind?",
  };

  const { getMentionSelectProps: getConceptProps, plugin: conceptPlugin } =
    useCustomMentionPlugin({
      mentionables: concepts
        ? concepts.map((c) =>
            toMentionable(urlSafeIdToConceptName(conceptIdFromUri(asUrl(c))))
          )
        : [],
      pluginKey: ELEMENT_CONCEPT,
      pattern: Patterns.Concept,
      newMentionable: (s) => {
        return toMentionable(s);
      },
    });

  const { getMentionSelectProps: getTagProps, plugin: tagPlugin } =
    useCustomMentionPlugin({
      mentionables: [],
      pluginKey: ELEMENT_TAG,
      pattern: Patterns.Tag,
      newMentionable: (s) => {
        return toMentionable(s);
      },
    });

  const { getMentionSelectProps: getMentionProps, plugin: mentionPlugin } =
    useCustomMentionPlugin({
      mentionables: [],
      pluginKey: P.ELEMENT_MENTION,
      pattern: Patterns.Mention,
      newMentionable: (s) => {
        return toMentionable(s);
      },
    });

  const plugins = useMemo(
    () => [...defaultPlugins, conceptPlugin, tagPlugin, mentionPlugin],
    [conceptPlugin, tagPlugin, mentionPlugin]
  );

  return (
    <P.Plate
      id={editorId}
      plugins={plugins}
      components={components}
      options={defaultOptions}
      editableProps={editableProps}
      initialValue={initialValue}
      onChange={onChange}
    >
      <P.HeadingToolbar>
        <ToolbarButtonsBasicElements />
        <ToolbarButtonsList />
        <P.ToolbarLink icon={<LinkIcon />} />
        <P.ToolbarImage icon={<ImageIcon />} />
      </P.HeadingToolbar>

      <BallonToolbarMarks />

      <P.MentionSelect
        {...getConceptProps()}
        renderLabel={ConceptSelectLabel}
      />
      <P.MentionSelect {...getTagProps()} renderLabel={TagSelectLabel} />
      <P.MentionSelect
        {...getMentionProps()}
        renderLabel={MentionSelectLabel}
      />
    </P.Plate>
  );
}
