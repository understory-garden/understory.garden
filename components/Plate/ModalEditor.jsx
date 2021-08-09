import React, { useState } from 'react'
import * as P from '@udecode/plate'
import {
  ToolbarButtonsList,
  ToolbarButtonsBasicElements,
  ToolbarButtonsBasicMarks,
  ToolbarButtonsTable,
  BallonToolbarMarks,
} from './Toolbars'
import { Image } from '@styled-icons/material/Image'
import { Link } from '@styled-icons/material/Link'

import { useCurrentWorkspace } from '../../hooks/app'
import { useWebId } from 'swrlit'

const components = P.createPlateComponents({
  [P.ELEMENT_H1]: P.withProps(P.StyledElement, { as: 'h1', }),
  [P.ELEMENT_H2]: P.withProps(P.StyledElement, { as: 'h2', }),
  [P.ELEMENT_H3]: P.withProps(P.StyledElement, { as: 'h3', }),
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
        P.insertEmptyCodeBlock(editor , {
          defaultType: P.getPlatePluginType(editor , P.ELEMENT_DEFAULT),
          insertNodesOptions: { select: true },
        });
      },
    },
    {
      type: P.ELEMENT_CODE_BLOCK,
      markup: '``',
      trigger: '`',
      triggerAtBlockStart: false,
      preFormat,
      format: (editor) => {
        P.insertEmptyCodeBlock(editor , {
          defaultType: P.getPlatePluginType(editor , P.ELEMENT_DEFAULT),
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

const plugins = [
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
  P.createMediaEmbedPlugin(),
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
  const editableProps = { placeholder: 'Title' }
  const initialTitleElement = [{
    type: P.ELEMENT_H1,
    children: [{ text: '' }],
  }]
  const plateId = 'modal-editor'
  const { setValue: setPlateValue, resetEditor } = P.usePlateActions(plateId)


  const webId = useWebId()
  const { workspace, slug: workspaceSlug } = useCurrentWorkspace()
  const [value, setValue] = useState(initialTitleElement)
  const [createAnother, setCreateAnother] = useState(false)
  const resetModal = () => {
    setValue(initialTitleElement)
    setPlateValue(initialTitleElement)
    resetEditor()
  }
  const onChange = (newValue) => {
    setValue(newValue)
  }
  const onSubmit = () => {
    // create({title, slate})
    console.log(value)
    if (createAnother) {
      resetModal()
    } else {
      closeModal()
    }
  }

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
            initialValue={value}
            onChange={onChange}>
            <BallonToolbarMarks />
            <P.HeadingToolbar>
              <ToolbarButtonsBasicElements />
              <ToolbarButtonsList />
              <P.ToolbarLink icon={<Link />} />
              <P.ToolbarImage icon={<Image />} />
            </P.HeadingToolbar>
          </P.Plate>
        </div>

        <div className="block flex-none bottom-0 right-0 w-full bg-mist px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-echeveria text-base font-medium text-white hover:bg-echeveria :outline-none focus:ring-2 focus:ring-offset-2 focus:ring-echeveria-700 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={onSubmit}>
            Create
          </button>
          <button type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-mist shadow-sm px-4 py-2 bg-white text-base font-medium text-storm hover:bg-mist focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
