import { useRouter } from 'next/router'
import { handleToWebId, profilePath } from "../../utils/uris"
import Notes from '../../components/Notes'
import Nav from '../../components/nav'

export default function ProfilePage(){
  const router = useRouter()
  const { query: { name, handle } } = router
  const webId = handleToWebId(handle)

  return (
    <div className="bg-black text-white h-screen">
      <Nav />
      <Notes path={profilePath(webId)}/>
    </div>
  )
}
