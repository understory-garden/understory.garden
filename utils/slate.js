import { Node } from "slate";
import * as P from "@udecode/plate";

export const EmptySlateJSON = [{ text: "" }];
export const ELEMENT_CONCEPT = "concept";
export const ELEMENT_TAG = "tag";

export function getConceptNodes(node) {
  return Array.from(Node.nodes(node)).filter(([n]) => {
    return n.type === ELEMENT_CONCEPT;
  });
}

export function getConceptNameFromNode(node) {
  return node.value;
}

export function getTagNodes(node) {
  return Array.from(Node.nodes(node)).filter(([n]) => {
    return n.type === "ELEMENT_TAG";
  });
}

export function getTagNameFromNode(node) {
  return node.value;
}

const newElementType = {
  "heading-one": P.ELEMENT_H1,
  "heading-two": P.ELEMENT_H2,
  "heading-three": P.ELEMENT_H3,
  "heading-four": P.ELEMENT_H3,
  "heading-five": P.ELEMENT_H3,
  "heading-six": P.ELEMENT_H3,
  "bulleted-list": P.ELEMENT_UL,
  "numbered-list": P.ELEMENT_OL,
  "list-item": P.ELEMENT_LI,
  "check-list-item": P.ELEMENT_TODO_LI,
  "block-quote": P.ELEMENT_BLOCKQUOTE,
  image: P.ELEMENT_IMAGE,
  video: P.ELEMENT_MEDIA_EMBED,
  link: P.ELEMENT_LINK,
  concept: ELEMENT_CONCEPT,
  tag: ELEMENT_TAG,
  paragraph: P.ELEMENT_PARAGRAPH,
};

function convertLeaf(l) {
  // must be a text node
  console.assert(l.text);
  // no conversion needed
  return l;
}

function convertElement(e) {
  // recursive
  switch (e.type) {
    case "heading-one":
    case "heading-two":
    case "heading-three":
    case "heading-four":
    case "heading-five":
    case "heading-six":
    case "bulleted-list":
    case "numbered-list":
    case "list-item":
    case "check-list-item":
    case "block-quote":
    case "paragraph":
    case "link":
      return {
        ...e,
        type: newElementType[e.type],
        children: e.children.map(convertElement),
      };
    case "image":
    case "video":
      return {
        ...e,
        type: newElementType[e.type],
        children: [{ text: "" }],
      };
    case "concept":
    case "tag":
      return {
        ...e,
        type: newElementType[e.type],
        children: [{ text: "" }],
        value: e.name,
      };
    default:
      return convertLeaf(e);
  }
}

export function noteBodyToSlateJSON(noteBody) {
  // takes a legacy slate JSON obejct (stored at the noteBody predicate), and conversts it to the new plate format.
  return noteBody && noteBody.map(convertElement);
}
