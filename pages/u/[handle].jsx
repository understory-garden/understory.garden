import { useRouter } from 'next/router'
import { FOAF } from '@inrupt/vocab-common-rdf'
import { sioc as SIOC } from 'rdf-namespaces'
import { getStringNoLocale, addUrl, removeUrl, getUrl } from '@inrupt/solid-client'
import { useProfile, useMyProfile, useWebId } from 'swrlit'
import Link from 'next/link'

import { handleToWebId, profilePath } from "../../utils/uris"
import Notes from '../../components/Notes'
import Nav from '../../components/nav'
import WebMonetization from '../../components/WebMonetization'
import { useFollows } from '../../hooks/people'

export default function ProfilePage(){
  const router = useRouter()
  const { query: { handle } } = router
  const webId = handleToWebId(handle)
  const { profile } = useProfile(webId)
  const name = profile && getStringNoLocale(profile, FOAF.name)

  const { profile: myProfile, save: saveProfile } = useMyProfile()
  const profileImage = profile && getUrl(profile, FOAF.img)

  async function follow(){
    await saveProfile(addUrl(myProfile, SIOC.follows, webId))
  }
  async function unfollow(){
    await saveProfile(removeUrl(myProfile, SIOC.follows, webId))
  }
  const myWebId = useWebId()
  const isMyProfile = (myWebId === webId)
  const follows = useFollows()
  const alreadyFollowing = follows && follows.includes(webId)
  return (
    <div className="page">
      <WebMonetization webId={webId}/>
      <Nav />
      <div className="flex flex-row mt-6 mb-6 justify-between items-start">
        <div className="flex flex-row">
          {profileImage && <img className="rounded-full h-36 w-36 object-cover mr-12" src={profileImage} /> }
          <div className="flex flex-col">
            {name && (
              <h3 className="text-4xl text-center">{name}</h3>
            )}
          </div>
        </div>
        {(follows && !isMyProfile) && (
          alreadyFollowing ? (
            <button className="btn py-1" onClick={unfollow}>
              unfollow
            </button>
          ) : (
            <button className="btn py-1" onClick={follow}>
              follow
            </button>
          )
        )}
      </div>
      <Notes path={profilePath(webId)} webId={webId}/>
    </div>
  )
}
