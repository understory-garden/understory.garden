import { useRouter } from 'next/router'
import { FOAF } from '@inrupt/vocab-common-rdf'
import { sioc as SIOC } from 'rdf-namespaces'
import { getStringNoLocale, addUrl } from '@inrupt/solid-client'
import { useProfile, useMyProfile } from 'swrlit'

import { handleToWebId, profilePath } from "../../utils/uris"
import Notes from '../../components/Notes'
import Nav from '../../components/nav'

export default function ProfilePage(){
  const router = useRouter()
  const { query: { handle } } = router
  const webId = handleToWebId(handle)
  const { profile } = useProfile(webId)
  const name = profile && getStringNoLocale(profile, FOAF.name)

  const { profile: myProfile, save: saveProfile } = useMyProfile()

  async function follow(){
    await saveProfile(addUrl(myProfile, SIOC.follows, webId))
  }

  return (
    <div className="bg-black text-white h-screen">
      <Nav />
      {name && (
        <h3 className="text-4xl text-center font-logo">{name}</h3>
      )}
      <button onClick={follow}>
        follow
      </button>
      <Notes path={profilePath(webId)}/>
    </div>
  )
}
