import { useFacebabyContainerUri } from './uris'
import { useResource, useWebId } from 'swrlit'

export function useConceptIndex(){
  const webId = useWebId()
  const appContainerUri = useFacebabyContainerUri(webId)

  const conceptIndexUri = appContainerUri && `${appContainerUri}concepts.ttl`
  const {resource: index, ...rest} = useResource(conceptIndexUri)
  return {index, ...rest}
}
