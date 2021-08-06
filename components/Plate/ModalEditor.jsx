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
import { Search } from '@styled-icons/material/Search';
import { FontDownload } from '@styled-icons/material/FontDownload';
import { FormatColorText } from '@styled-icons/material/FormatColorText';

export default function ModalEditor() {

  let styledComponents = P.createPlateComponents({
    [P.MARK_COLOR]: P.withStyledProps(P.StyledLeaf, {
      leafProps: {
        [P.MARK_COLOR]: ['color']
      },
    }),
    [P.MARK_BG_COLOR]: P.withStyledProps(P.StyledLeaf, {
      leafProps: {
        [P.MARK_BG_COLOR]: ['backgroundColor']
      },
    }),
  });

  styledComponents = P.withPlaceholders(styledComponents, [
    {
      key: P.ELEMENT_H1,
      placeholder: 'Title goes here',
      hideOnBlur: false,
    },
    {
      key: P.ELEMENT_PARAGRAPH,
      placeholder: 'Brilliant ideas go here',
      hideOnBlur: true,
    },
  ]);

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

  const Editor = () => {
    const { setSearch, plugin: searchHighlightPlugin } = P.useFindReplacePlugin();

    const pluginsMemo = useMemo(() => {
      const plugins = [
        P.createReactPlugin(),
        P.createHistoryPlugin(),
        P.createParagraphPlugin(),
        P.createBlockquotePlugin(),
        P.createTodoListPlugin(),
        P.createHeadingPlugin(),
        P.createImagePlugin(),
        P.createLinkPlugin(),
        P.createListPlugin(),
        P.createTablePlugin(),
        P.createMediaEmbedPlugin(),
        P.createCodeBlockPlugin(),
        P.createBoldPlugin(),
        P.createCodePlugin(),
        P.createItalicPlugin(),
        P.createHighlightPlugin(),
        P.createUnderlinePlugin(),
        P.createStrikethroughPlugin(),
        P.createSubscriptPlugin(),
        P.createSuperscriptPlugin(),
        P.createFontColorPlugin(),
        P.createFontBackgroundColorPlugin(),
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
        P.createTrailingBlockPlugin({ type: P.ELEMENT_PARAGRAPH }),
        P.createSelectOnBackspacePlugin({ allow: P.ELEMENT_IMAGE }),
        searchHighlightPlugin,
      ];

      plugins.push(...[
        P.createDeserializeMDPlugin({ plugins }),
        P.createDeserializeCSVPlugin({ plugins }),
        P.createDeserializeHTMLPlugin({ plugins }),
        P.createDeserializeAstPlugin({ plugins }),
      ]);

      return plugins;
    }, [defaultOptions, searchHighlightPlugin]);

    return (
      <P.Plate
        id="modal-editor"
        plugins={pluginsMemo}
        components={styledComponents}
        options={defaultOptions}
      >
        <P.ToolbarSearchHighlight icon={Search} setSearch={setSearch} />
        <P.HeadingToolbar>
          <ToolbarButtonsBasicElements />
          <ToolbarButtonsList />
          <ToolbarButtonsBasicMarks />
          <ToolbarButtonsTable />
          <P.ToolbarColorPicker pluginKey={P.MARK_COLOR} icon={<FormatColorText />} />
          <P.ToolbarColorPicker pluginKey={P.MARK_BG_COLOR} icon={<FontDownload />} />
          <P.ToolbarLink icon={<Link />} />
          <P.ToolbarImage icon={<Image />} />
        </P.HeadingToolbar>

        <BallonToolbarMarks />

      </P.Plate>
    );
  }

  return <Editor />;
}
