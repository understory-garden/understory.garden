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
  return Node.string(node)
}
