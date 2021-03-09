import { useRouter } from 'next/router'
import { useWebId } from 'swrlit'

import NotePageComponent from "../../../components/NotePage"
import { WorkspaceProvider } from "../../../contexts/WorkspaceContext"
import { useIntervalBackups } from '../../../hooks/backups'
import {
  publicNotePath, privateNotePath, profilePath, conceptUriToName,
  conceptNameToUrlSafeId, urlSafeIdToConceptName, tagNameToUrlSafeId
} from '../../../utils/uris'


function EditableNotePage({webId, encodedName}){
  const name = encodedName && urlSafeIdToConceptName(encodedName)
  useIntervalBackups(name)
  return (
    <NotePageComponent webId={webId} encodedName={encodedName} />
  )
}

export default function NotePage(){
  const router = useRouter()
  const { query: { name, workspace } } = router
  const webId = useWebId()
  return (
    <WorkspaceProvider webId={webId} slug={workspace}>
      <EditableNotePage webId={webId} encodedName={name} />
    </WorkspaceProvider>
  )
}
