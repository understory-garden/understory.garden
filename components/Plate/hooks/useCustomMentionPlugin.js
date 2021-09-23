// forked from https://raw.githubusercontent.com/udecode/plate/ac3f7d9072c3dd12e971d52af68d07ee18496f57/packages/elements/mention/src/useMentionPlugin.ts

import { useCallback, useMemo, useState } from "react";
import * as P from "@udecode/plate";
import { ELEMENT_MENTION } from "@udecode/plate";
import { ELEMENT_CONCEPT, ELEMENT_TAG } from "../../../utils/slate";
import { Range, Transforms, Editor, Text } from "slate";

export function patternForPluginKey(pluginKey) {
  switch (pluginKey) {
    case ELEMENT_CONCEPT:
      return /\B\[\[([^\]]*)\]{0,2}/;
    case ELEMENT_TAG:
      return /\B\#([\w-]*)\b/;
    case ELEMENT_MENTION:
      return /\B\@([\w-]*)\b/;
    default:
      throw new Error(
        `Unsupported pluginType used with customMentionPlugin: ${pluginKey}`
      );
  }
}

export const toMentionable = (data) => {
  return { value: data };
};
export const fromMentionable = (m) => {
  return m.value;
};

/**
 * Enables support for autocompleting @mentions and #tags.
 * When typing a token that matches a configurable pattern, a select
 * component appears with autocompleted suggestions. If nothing
 * is chosen, a new mention is created with the content matching `pattern`
 */
export function useCustomMentionPlugin({
  mentionables = [],
  maxSuggestions = 10,
  mentionableFilter = (search) => (c) =>
    search && c.value.toLowerCase().includes(search.toLowerCase()),
  insertSpaceAfterMention = true,
  pluginKey = ELEMENT_MENTION,
  newMentionable = undefined, // if not defined, won't create new mentionable.
}) {
  const [targetRange, setTargetRange] = useState(null);
  const [valueIndex, setValueIndex] = useState(0);
  const [search, setSearch] = useState("");
  const pattern = patternForPluginKey(pluginKey);
  console.log(pluginKey, pattern);
  const values = useMemo(() => {
    const filtered = mentionables
      .filter(mentionableFilter(search))
      .slice(0, maxSuggestions);
    if (newMentionable && search) {
      return filtered.concat(newMentionable(search));
    } else {
      return filtered;
    }
  }, [maxSuggestions, mentionableFilter, mentionables, search]);

  const onAddMention = useCallback(
    (editor, data) => {
      if (targetRange !== null && data !== null) {
        Transforms.select(editor, targetRange);
        P.insertMention(editor, { data, insertSpaceAfterMention, pluginKey });
      }
    },
    [targetRange, insertSpaceAfterMention, pluginKey]
  );

  const onKeyDownMention = useCallback(
    (editor) => (e) => {
      if (targetRange) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          return setValueIndex(P.getNextIndex(valueIndex, values.length - 1));
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          return setValueIndex(
            P.getPreviousIndex(valueIndex, values.length - 1)
          );
        }
        if (e.key === "Escape") {
          e.preventDefault();
          return setTargetRange(null);
        }

        if (["Tab", "Enter"].includes(e.key)) {
          e.preventDefault();
          onAddMention(editor, values[valueIndex]);
          return false;
        }
      }
    },
    [targetRange, valueIndex, values, onAddMention]
  );

  const onChangeMention = useCallback(
    (editor) => () => {
      const { selection } = editor;

      if (selection && P.isCollapsed(selection)) {
        const cursor = Range.start(selection);
        const at = cursor;

        // Point
        const lineStart = Editor.before(editor, at, { unit: "line" });

        // Range from before to start
        const beforeRange = lineStart && Editor.range(editor, lineStart, at);

        // Before text
        const beforeText = P.getText(editor, beforeRange);

        // Match regex on before text
        const match = !!beforeText && beforeText.match(pattern);
        // Point at the start of mention
        const mentionStart = match
          ? Editor.before(editor, at, {
              unit: "character",
              distance: match[0].length,
            })
          : null;

        // Range from mention to start
        const range = mentionStart && Editor.range(editor, mentionStart, at);

        if (match && P.isPointAtWordEnd(editor, { at })) {
          setTargetRange(range);
          const [, word] = match;
          setSearch(word);
          setValueIndex(0);
          return;
        }

        setTargetRange(null);
      }
    },
    [setTargetRange, setSearch, setValueIndex]
  );

  return {
    plugin: useMemo(
      () => ({
        pluginKeys: pluginKey,
        onChange: onChangeMention,
        renderElement: P.getRenderElement(pluginKey),
        onKeyDown: onKeyDownMention,
        deserialize: P.getMentionDeserialize(pluginKey),
        inlineTypes: P.getPlatePluginTypes(pluginKey),
        voidTypes: P.getPlatePluginTypes(pluginKey),
      }),
      [onChangeMention, onKeyDownMention, pluginKey]
    ),

    getMentionSelectProps: useCallback(
      () => ({
        at: targetRange,
        valueIndex,
        setValueIndex,
        options: values,
        onClickMention: onAddMention,
      }),
      [onAddMention, targetRange, valueIndex, values]
    ),
    searchValue: search,
  };
}

const withNormalizeMentions =
  ({ pluginKeys }) =>
  (editor) => {
    const { normalizeNode } = editor;

    editor.normalizeNode = ([node, path]) => {
      if (Text.isText(node)) {
        for (const pluginKey of pluginKeys) {
          const pattern = patternForPluginKey(pluginKey);
          const matchInfo = node.text.match(pattern);

          if (matchInfo) {
            const { index, 0: match, 1: word } = matchInfo;
            const at = {
              anchor: { path, offset: index },
              focus: { path, offset: index + match.length },
            };
            Transforms.setNodes(
              editor,
              { type: pluginKey, value: word, children: [] },
              { at, split: true }
            );
            return;
          }
        }
      }

      normalizeNode([node, path]); // continue the normalization chain if not transformed
    };

    return editor;
  };

export const createNormalizeMentionsPlugin = P.getPlatePluginWithOverrides(
  withNormalizeMentions
);
