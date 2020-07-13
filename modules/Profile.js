import { foaf, vcard } from 'rdf-namespaces'
import {
  getStringNoLocaleOne, getUrlOne
} from '@solid/lit-pod'

import useWebId from "../hooks/useWebId"
import useThing from "../hooks/useThing"
import {Module} from "../components/layout"

export default function Profile(){
  const webId = useWebId()
  const {thing: profile} = useThing(webId)
  const name = profile && getStringNoLocaleOne(profile, foaf.name)
  const profileImage = profile && getUrlOne(profile, vcard.hasPhoto)
  if (profile){
    return (
      <Module>
        <div>
          hello, {name}
        </div>
        {profileImage && <img src={profileImage} alt={name}/>}
      </Module>
    )
  } else {
    return <div>loading...</div>
  }

}
