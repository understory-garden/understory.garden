import { Node } from "slate"

export function getConceptNodes(node){
  return Array.from(Node.nodes(node)).filter(([n]) => {
    return (n.type === 'concept')
  })
}


export function getConceptNodesMatchingName(node, name){
  return Array.from(Node.nodes(node)).filter(([n]) => {
    return (n.type === 'concept') && (n.name === name)
  })
}

export function getConceptNameFromNode(node){
  return node.name
}

export function getTagNodes(node){
  return Array.from(Node.nodes(node)).filter(([n]) => {
    return (n.type === 'tag')
  })
}

export function getTagNameFromNode(node){
  return node.name
}
