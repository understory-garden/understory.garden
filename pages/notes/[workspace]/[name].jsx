import { useRouter } from 'next/router'
import { useWebId } from 'swrlit'

import NotePageComponent from "../../../components/NotePage"
import { WorkspaceProvider } from "../../../contexts/WorkspaceContext"
import {
  publicNotePath, privateNotePath, profilePath, conceptUriToName,
  conceptNameToUrlSafeId, urlSafeIdToConceptName, tagNameToUrlSafeId
} from '../../../utils/uris'

export default function NotePage(){
  const router = useRouter()
  const { query: { name, workspace } } = router
  const webId = useWebId()
  return (
    <WorkspaceProvider webId={webId} slug={workspace}>
      <NotePageComponent webId={webId} encodedName={name} />
    </WorkspaceProvider>
  )
}
