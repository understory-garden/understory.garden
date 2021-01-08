import { useRouter } from 'next/router'
import { FOAF } from '@inrupt/vocab-common-rdf'
import { getStringNoLocale } from '@inrupt/solid-client'
import { useProfile } from 'swrlit'

import { handleToWebId, profilePath } from "../../utils/uris"
import Notes from '../../components/Notes'
import Nav from '../../components/nav'

export default function ProfilePage(){
  const router = useRouter()
  const { query: { handle } } = router
  const webId = handleToWebId(handle)
  const { profile } = useProfile(webId)
  const name = profile && getStringNoLocale(profile, FOAF.name)

  return (
    <div className="bg-black text-white h-screen">
      <Nav />
      {name && (
        <h3 className="text-4xl text-center font-logo">{name}</h3>
      )}
      <Notes path={profilePath(webId)}/>
    </div>
  )
}
