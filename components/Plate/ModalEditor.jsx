import React, { useState, useMemo } from 'react'
import * as P from '@udecode/plate'
import { useSelected, useReadOnly } from 'slate-react';
import {  Editor } from 'slate';
import {
  ToolbarButtonsList,
  ToolbarButtonsBasicElements,
  BallonToolbarMarks,
} from './Toolbars'
import { Image } from '@styled-icons/material/Image'
import { Link } from '@styled-icons/material/Link'

import { useCurrentWorkspace } from '../../hooks/app'
import { useConcepts } from '../../hooks/concepts'
import { useWebId } from 'swrlit'

import { asUrl } from '@inrupt/solid-client'
import { urlSafeIdToConceptName } from '../../utils/uris'
import { conceptIdFromUri } from '../../model/concept'
import { useCustomMentionPlugin, Patterns, toMentionable, fromMentionable} from './hooks/useCustomMentionPlugin'

const ELEMENT_CONCEPT = "concept"
const ELEMENT_TAG = "tag"

const TestMentionables = [
  { value: '0', name: 'Aayla Secura', email: 'aayla_secura@force.com' },
  { value: '1', name: 'Adi Gallia', email: 'adi_gallia@force.com' },
  { value: '2', name: 'Admiral Dodd Rancit', email: 'admiral_dodd_rancit@force.com', },
  { value: '3', name: 'Admiral Firmus Piett', email: 'admiral_firmus_piett@force.com', },
  { value: '4', name: 'Admiral Gial Ackbar', email: 'admiral_gial_ackbar@force.com', },
]

const ConceptSelectLabel = (m) => {
  const name = fromMentionable(m)
  return <span className='text-lagoon'>[[{name}]]</span>
}

const TagSelectLabel = (m) => {
  const tag = fromMentionable(m)
  return <span className='text-lagoon'>#{tag}</span>
}

const MentionSelectLabel = (m) => {
  const mention = fromMentionable(m)
  return <span className='text-lagoon'>@{mention}</span>
}

const components = P.createPlateComponents({
  [P.ELEMENT_H1]: P.withProps(P.StyledElement, { as: 'h1', }),
  [P.ELEMENT_H2]: P.withProps(P.StyledElement, { as: 'h2', }),
  [P.ELEMENT_H3]: P.withProps(P.StyledElement, { as: 'h3', }),
  [ELEMENT_CONCEPT]: P.withProps(P.MentionElement, {
    renderLabel: ConceptSelectLabel,
  }),
  [ELEMENT_TAG]: P.withProps(P.MentionElement, {
    renderLabel: TagSelectLabel,
  }),
  [P.ELEMENT_MENTION]: P.withProps(P.MentionElement, {
    renderLabel: MentionSelectLabel,
  }),
});

const defaultOptions = P.createPlateOptions();

const preFormat = (editor) => P.unwrapList(editor);

const optionsAutoformat = {
  rules: [
      {
        type: P.ELEMENT_H1,
        markup: '#',
        preFormat,
      },
      {
        type: P.ELEMENT_H2,
        markup: '##',
        preFormat,
      },
      {
        type: P.ELEMENT_H3,
        markup: '###',
        preFormat,
      },
    {
      type: P.ELEMENT_LI,
      markup: ['*', '-'],
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
      markup: ['1.', '1)'],
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
      markup: ['[]'],
    },
    {
      type: P.ELEMENT_BLOCKQUOTE,
      markup: ['>'],
      preFormat,
    },
    {
      type: P.MARK_BOLD,
      between: ['**', '**'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: P.MARK_BOLD,
      between: ['__', '__'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: P.MARK_ITALIC,
      between: ['*', '*'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: P.MARK_ITALIC,
      between: ['_', '_'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: P.MARK_CODE,
      between: ['`', '`'],
      mode: 'inline',
      insertTrigger: true,
    },
    {
      type: P.ELEMENT_CODE_BLOCK,
      markup: '``',
      trigger: '`',
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
      hotkey: 'Enter',
      predicate: P.isBlockAboveEmpty,
    },
    {
      ...resetBlockTypesCommonRule,
      hotkey: 'Backspace',
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
      { hotkey: 'shift+enter' },
      {
        hotkey: 'enter',
        query: {
          allow: [P.ELEMENT_CODE_BLOCK, P.ELEMENT_BLOCKQUOTE, P.ELEMENT_TD],
        },
      },
    ],
  }),
  P.createExitBreakPlugin({
    rules: [
      {
        hotkey: 'mod+enter',
      },
      {
        hotkey: 'mod+shift+enter',
        before: true,
      },
      {
        hotkey: 'enter',
        query: {
          start: true,
          end: true,
          allow: P.KEYS_HEADING,
        },
      },
    ],
  }),
  P.createNormalizeTypesPlugin({
    rules: [{ path: [0], strictType: P.ELEMENT_H1 }],
  }),
  P.createSelectOnBackspacePlugin({ allow: P.ELEMENT_IMAGE }),
];

export default function ModalEditor({create, closeModal}) {
  const webId = useWebId()
  const { concepts } = useConcepts(webId)
  const { workspace, slug: workspaceSlug } = useCurrentWorkspace()

  const plateId = 'modal-editor'
  const editableProps = { placeholder: 'Title' }
  const initialTitleElement = [{
    type: P.ELEMENT_H1,
    children: [{ text: '' }],
  }]

  const value = P.useStoreEditorValue(plateId) 
  const editor = P.useStoreEditorState(plateId) 
  const { setValue, resetEditor } = P.usePlateActions(plateId)
  const [createAnother, setCreateAnother] = useState(false)
  const resetModal = () => {
    setValue(initialTitleElement)
    resetEditor()
  }
  const onSubmit = () => {
    create(value)
    if (createAnother) {
      resetModal()
    } else {
      closeModal()
    }
  }


  const { getMentionSelectProps: getConceptProps, plugin: conceptPlugin } = useCustomMentionPlugin({
    mentionables: concepts.map(c => toMentionable(urlSafeIdToConceptName(conceptIdFromUri(asUrl(c))))),
    pluginKey: ELEMENT_CONCEPT,
    pattern: Patterns.Concept,
    newMentionable: (s) => {
      return toMentionable(s)
    }
  })

  const { getMentionSelectProps: getTagProps, plugin: tagPlugin } = useCustomMentionPlugin({
    mentionables: TestMentionables.map((m) => toMentionable(m.email)),
    pluginKey: ELEMENT_TAG,
    pattern: Patterns.Tag,
    newMentionable: (s) => {
      return toMentionable(s)
    }
  })

  const { getMentionSelectProps: getMentionProps, plugin: mentionPlugin } = useCustomMentionPlugin({
    mentionables: TestMentionables.map((m) => toMentionable(m.name)),
    pluginKey: P.ELEMENT_MENTION,
    pattern: Patterns.Mention,
    newMentionable: (s) => {
      return toMentionable(s)
    }
  })

  const plugins = useMemo(
    () => [
      ...defaultPlugins,
      conceptPlugin,
      tagPlugin,
      mentionPlugin,
    ],
    [conceptPlugin, tagPlugin, mentionPlugin]
  )

  return (
    <div className="fixed w-full h-full top-0 left-0 flex items-center justify-center">
      <div className="absolute w-full h-full bg-storm opacity-95"></div>
      <div className="flex-column fixed align-bottom min-w-2/5 min-h-1/5 max-w-4/5 max-h-4/5 overflow-y-auto overflow-x-hidden bg-snow z-50 opactiy-100 rounded-lg shadow-xl">
        <button type="button" className="absolute top-0 right-0 cursor-pointer flex flex-col items-center mt-4 mr-4 text-fog text-sm z-50" onClick={closeModal}>
          <svg className="fill-current text-mist" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 18 18">
            <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
          </svg>
        </button>

        <div className="flow-root w-full text-left p-4">
          <P.Plate id={plateId}
            plugins={plugins}
            components={components}
            options={defaultOptions}
            editableProps={editableProps}
            initialValue={initialTitleElement}>

            <P.HeadingToolbar>
              <ToolbarButtonsBasicElements />
              <ToolbarButtonsList />
              <P.ToolbarLink icon={<Link />} />
              <P.ToolbarImage icon={<Image />} />
            </P.HeadingToolbar>

            <BallonToolbarMarks />

            <P.MentionSelect
              {...getConceptProps()}
              renderLabel={ConceptSelectLabel}
            />
            <P.MentionSelect
              {...getTagProps()}
              renderLabel={TagSelectLabel}
            />
            <P.MentionSelect
              {...getMentionProps()}
              renderLabel={MentionSelectLabel}
            />


          </P.Plate>
        </div>

        <div className="block flex-none bottom-0 right-0 w-full bg-mist px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button type="button"
            className="btn"
            onClick={onSubmit}>
            Create
          </button>
          <button type="button"
            className="cancel btn"
            onClick={closeModal}>
            Cancel
          </button>
          <label className="inline-flex items-center">
            <input className="form-checkbox text-echeveria"
              type="checkbox"
              checked={createAnother}
              onChange={e => setCreateAnother(e.target.checked)} />
            <span className="ml-2">Create another</span>
          </label>
        </div>
      </div>
    </div>
  );
}
