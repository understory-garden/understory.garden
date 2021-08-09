import 'tippy.js/animations/scale.css';
import 'tippy.js/dist/tippy.css';
import { TippyProps } from '@tippyjs/react';
import * as P from '@udecode/plate'

import { CodeAlt } from '@styled-icons/boxicons-regular/CodeAlt';
import { CodeBlock } from '@styled-icons/boxicons-regular/CodeBlock';
import { Highlight } from '@styled-icons/boxicons-regular/Highlight';
import { Subscript } from '@styled-icons/foundation/Subscript';
import { Superscript } from '@styled-icons/foundation/Superscript';
import { GridOn } from '@styled-icons/material/GridOn';
import { GridOff } from '@styled-icons/material/GridOff';
import { GetApp } from '@styled-icons/material/GetApp';
import { Upload } from '@styled-icons/material/Upload';
import { SkipNext } from '@styled-icons/material/SkipNext';
import { SkipPrevious } from '@styled-icons/material/SkipPrevious';
import { FormatAlignCenter } from '@styled-icons/material/FormatAlignCenter';
import { FormatAlignJustify } from '@styled-icons/material/FormatAlignJustify';
import { FormatAlignLeft } from '@styled-icons/material/FormatAlignLeft';
import { FormatAlignRight } from '@styled-icons/material/FormatAlignRight';
import { FormatBold } from '@styled-icons/material/FormatBold';
import { FormatItalic } from '@styled-icons/material/FormatItalic';
import { FormatListBulleted } from '@styled-icons/material/FormatListBulleted';
import { FormatListNumbered } from '@styled-icons/material/FormatListNumbered';
import { FormatQuote } from '@styled-icons/material/FormatQuote';
import { FormatStrikethrough } from '@styled-icons/material/FormatStrikethrough';
import { FormatUnderlined } from '@styled-icons/material/FormatUnderlined';
import { Keyboard } from '@styled-icons/material/Keyboard';
import { Looks3 } from '@styled-icons/material/Looks3';
import { Looks4 } from '@styled-icons/material/Looks4';
import { Looks5 } from '@styled-icons/material/Looks5';
import { Looks6 } from '@styled-icons/material/Looks6';
import { LooksOne } from '@styled-icons/material/LooksOne';
import { LooksTwo } from '@styled-icons/material/LooksTwo';

export const ToolbarButtonsBasicElements = () => {
  const editor = P.useStoreEditorRef(P.useEventEditorId('focus'));

  return (
    <>
      <P.ToolbarElement
        type={P.getPlatePluginType(editor, P.ELEMENT_H1)}
        icon={<LooksOne />}
      />
      <P.ToolbarElement
        type={P.getPlatePluginType(editor, P.ELEMENT_H2)}
        icon={<LooksTwo />}
      />
      <P.ToolbarElement
        type={P.getPlatePluginType(editor, P.ELEMENT_H3)}
        icon={<Looks3 />}
      />
      <P.ToolbarElement
        type={P.getPlatePluginType(editor, P.ELEMENT_BLOCKQUOTE)}
        icon={<FormatQuote />}
      />
      <P.ToolbarCodeBlock
        type={P.getPlatePluginType(editor, P.ELEMENT_CODE_BLOCK)}
        icon={<CodeBlock />}
      />
    </>
  );
};


// TODO: list break / have weird behavior when switching between list types, probably due to poor logic in
// https://github.com/udecode/plate/blob/ac3f7d9072c3dd12e971d52af68d07ee18496f57/packages/elements/list/src/transforms/toggleList.ts
export const ToolbarButtonsList = () => {
  const editor = P.useStoreEditorRef(P.useEventEditorId('focus'));

  return (
    <>
      <P.ToolbarList
        type={P.getPlatePluginType(editor, P.ELEMENT_UL)}
        icon={<FormatListBulleted />}
      />
      <P.ToolbarList
        type={P.getPlatePluginType(editor, P.ELEMENT_OL)}
        icon={<FormatListNumbered />}
      />
    </>
  );
};

export const ToolbarButtonsBasicMarks = () => {
  const editor = P.useStoreEditorRef(P.useEventEditorId('focus'));

  return (
    <>
      <P.ToolbarMark
        type={P.getPlatePluginType(editor, P.MARK_BOLD)}
        icon={<FormatBold />}
      />
      <P.ToolbarMark
        type={P.getPlatePluginType(editor, P.MARK_ITALIC)}
        icon={<FormatItalic />}
      />
      <P.ToolbarMark
        type={P.getPlatePluginType(editor, P.MARK_UNDERLINE)}
        icon={<FormatUnderlined />}
      />
      <P.ToolbarMark
        type={P.getPlatePluginType(editor, P.MARK_CODE)}
        icon={<CodeAlt />}
      />
      <P.ToolbarMark
        type={P.getPlatePluginType(editor, P.MARK_HIGHLIGHT)}
        icon={<Highlight />}
        tooltip={{ content: 'Highlight', ...tooltip }}
      />
    </>
  );
};

export const BallonToolbarMarks = () => {
  const editor = P.useStoreEditorRef(P.useEventEditorId('focus'));

  const arrow = false;
  const theme = 'dark';
  const direction = 'top';
  const hiddenDelay = 0;
  const tooltip = {
    arrow: true,
    delay: 0,
    duration: [200, 0],
    hideOnClick: false,
    offset: [0, 17],
    placement: 'top',
  };

  return (
    <P.BalloonToolbar
      direction={direction}
      hiddenDelay={hiddenDelay}
      theme={theme}
      arrow={arrow}
    >
      <P.ToolbarMark
        type={P.getPlatePluginType(editor, P.MARK_BOLD)}
        icon={<FormatBold />}
        tooltip={{ content: 'Bold (⌘B)', ...tooltip }}
      />
      <P.ToolbarMark
        type={P.getPlatePluginType(editor, P.MARK_ITALIC)}
        icon={<FormatItalic />}
        tooltip={{ content: 'Italic (⌘I)', ...tooltip }}
      />
      <P.ToolbarMark
        type={P.getPlatePluginType(editor, P.MARK_UNDERLINE)}
        icon={<FormatUnderlined />}
        tooltip={{ content: 'Underline (⌘U)', ...tooltip }}
      />
      <P.ToolbarMark
        type={P.getPlatePluginType(editor, P.MARK_CODE)}
        icon={<CodeAlt />}
        tooltip={{ content: 'Code', ...tooltip }}
      />
      <P.ToolbarMark
        type={P.getPlatePluginType(editor, P.MARK_HIGHLIGHT)}
        icon={<Highlight />}
        tooltip={{ content: 'Highlight', ...tooltip }}
      />
    </P.BalloonToolbar>
  );
};
