import { useRouter } from 'next/router'
import { useWebId } from 'swrlit'

import NotePageComponent from "../../../components/NotePage"
import { WorkspaceProvider } from "../../../contexts/WorkspaceContext"
import { useIntervalBackups } from '../../../hooks/backups'
import {
  publicNotePath, privateNotePath, profilePath, conceptUriToName,
  conceptNameToUrlSafeId, urlSafeIdToConceptName, tagNameToUrlSafeId
} from '../../../utils/uris'

function Backups({encodedName}){
  const name = encodedName && urlSafeIdToConceptName(encodedName)
  useIntervalBackups(name)
  // don't return anything for now, this component is pure side
  // effect, but in its own tree to avoid re-rendering everything below this
  // level
  return (<></>)
}

export default function NotePage(){
  const router = useRouter()
  const { query: { name, workspace } } = router
  const webId = useWebId()
  return (
    <WorkspaceProvider webId={webId} slug={workspace}>
      <NotePageComponent webId={webId} encodedName={name} />
      <Backups encodedName={name}/>
    </WorkspaceProvider>
  )
}
