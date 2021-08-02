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

export function getImageNodes(node){
  return Array.from(Node.nodes(node)).filter(([n]) => {
    return (n.type === 'image')
  })
}

export function getLinkNodes(node){
  return Array.from(Node.nodes(node)).filter(([n]) => {
    return (n.type === 'link')
  })
}

export function getImageSrcFromNode(node){
  return node.url
}

export function getLinkFromNode(node){
  return node.url
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
