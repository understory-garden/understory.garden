import { useRouter } from 'next/router'
import { useWebId } from 'swrlit'

import NotePageComponent from "../../components/NotePage"

export default function NotePage(){
  const router = useRouter()
  const { query: { name } } = router
  const webId = useWebId()

  return <NotePageComponent webId={webId} name={name}/>
}
