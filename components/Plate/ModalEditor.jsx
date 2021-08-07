import React, { useMemo } from 'react'
import * as P from '@udecode/plate'
import {
  ToolbarButtonsList,
  ToolbarButtonsBasicElements,
  ToolbarButtonsBasicMarks,
  ToolbarButtonsTable,
  BallonToolbarMarks,
} from './Toolbars'
import { Image } from '@styled-icons/material/Image';
import { Link } from '@styled-icons/material/Link';
import { FontDownload } from '@styled-icons/material/FontDownload';
import { FormatColorText } from '@styled-icons/material/FormatColorText';


const components = P.createPlateComponents({
  [P.ELEMENT_H1]: P.withProps(P.StyledElement, { as: 'H1', }),
  [P.ELEMENT_H2]: P.withProps(P.StyledElement, { as: 'H2', }),
  [P.ELEMENT_H3]: P.withProps(P.StyledElement, { as: 'H3', }),
});

const defaultOptions = P.createPlateOptions();

const preFormat = (editor) => P.unwrapList(editor);

const optionsAutoformat = {
  rules: [
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
      type: P.MARK_STRIKETHROUGH,
      between: ['~~', '~~'],
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

export default function ModalEditor() {

    const editableProps = {
      placeholder: 'Title',
    };

    const initialTitleElement = [
      {
        type: P.ELEMENT_H1,
        children: [ { text: '' }, ],
      },
    ];

    return (
        <P.Plate id="modal-editor"
          plugins={plugins}
          components={components}
          options={defaultOptions}
          editableProps={editableProps}
          initialValue={initialTitleElement}>
          <BallonToolbarMarks />
          <P.HeadingToolbar>
            <ToolbarButtonsBasicElements />
            <ToolbarButtonsList />
            <P.ToolbarLink icon={<Link />} />
            <P.ToolbarImage icon={<Image />} />
          </P.HeadingToolbar>
        </P.Plate>
    );
}
