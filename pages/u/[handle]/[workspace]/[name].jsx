import { useRouter } from 'next/router'
import { useWebId } from 'swrlit'

import NotePageComponent from "../../../../components/NotePage"
import { handleToWebId } from "../../../../utils/uris"
import { WorkspaceProvider } from "../../../../contexts/WorkspaceContext"

export default function NotePage(){
  const router = useRouter()
  const { query: { name, workspace, handle } } = router
  const webId = handleToWebId(handle)

  return (
    <WorkspaceProvider webId={webId} slug={workspace}>
      <NotePageComponent webId={webId} encodedName={name}
                         path={`/u/${handle}`} readOnly={true}/>
    </WorkspaceProvider>
  )
}
