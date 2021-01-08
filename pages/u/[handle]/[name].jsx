import { useRouter } from 'next/router'
import { useWebId } from 'swrlit'

import NotePageComponent from "../../../components/NotePage"
import { handleToWebId } from "../../../utils/uris"

export default function NotePage(){
  const router = useRouter()
  const { query: { name, handle } } = router
  const webId = handleToWebId(handle)

  return <NotePageComponent webId={webId} name={name} path={`/u/${handle}`}/>
}
