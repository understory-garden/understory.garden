import { useUnderstoryContainerUri } from './uris'
import { useResource, useWebId } from 'swrlit'
import { createSolidDataset, asUrl, getThingAll } from '@inrupt/solid-client'

export function useGnomesResource(webId) {
  // use   const concepts = index && getThingAll(index) to get all the gnome things from a resource
  // to save, use resource will give me a save function, need to pass save the updated resource
  // will have a new value for a particular predicate, will need to use setThing on the resource and then save the resource
  const appContainerUri = useUnderstoryContainerUri(webId)
  const gnomesUri = appContainerUri && `${appContainerUri}gnomes.ttl`
  const response = useResource(gnomesUri)
  const { error } = response
  if (error && (error.statusCode === 404)) {
    const emptyResource = createSolidDataset()
    response.resource = emptyResource
    return response
  } else {
    return response
  }
}
