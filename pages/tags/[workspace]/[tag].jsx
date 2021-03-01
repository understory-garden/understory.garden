import { useRouter } from 'next/router'
import { useWebId } from 'swrlit'
import { getUrl, getThing } from '@inrupt/solid-client'

import { useCombinedConceptIndex } from '../../../hooks/concepts'
import { useWorkspace } from '../../../hooks/app'
import { WorkspaceProvider } from "../../../contexts/WorkspaceContext"
import { US } from '../../../vocab'
import { tagNameToUrlSafeId } from '../../../utils/uris'
import { conceptUrisTaggedWith } from '../../../model/concept'
import { NotesFromConcepts } from '../../../components/Notes'
import Nav from '../../../components/Nav'

export default function TagPage(){
  const router = useRouter()
  const { query: { tag, workspace: workspaceSlug } } = router
  const webId = useWebId()
  const { workspace } = useWorkspace(webId, workspaceSlug)
  const tagPrefix = workspace && getUrl(workspace, US.tagPrefix)
  const { index } = useCombinedConceptIndex(webId, workspaceSlug)
  const conceptUris = index && conceptUrisTaggedWith(index, `${tagPrefix}${tagNameToUrlSafeId(tag)}`)
  const concepts = conceptUris.map(uri => getThing(index, uri))
  return (

    <WorkspaceProvider webId={webId} slug={workspace}>
      <div className="page">
        <Nav/>
        <NotesFromConcepts webId={webId} concepts={concepts}/>
      </div>
    </WorkspaceProvider>
  )
}
