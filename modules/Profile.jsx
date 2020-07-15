import { foaf, vcard } from 'rdf-namespaces'
import {
  getStringNoLocaleOne, getUrlOne
} from '@solid/lit-pod'

import useWebId from "../hooks/useWebId"
import useThing from "../hooks/useThing"
import { Module } from "../components/layout"

export default function Profile() {
  const webId = useWebId()
  const { thing: profile } = useThing(webId)
  const name = profile && getStringNoLocaleOne(profile, foaf.name)
  const profileImage = profile && getUrlOne(profile, vcard.hasPhoto)
  if (profile) {
    return (
      <Module className="p-6 wiggly">
        <div className="inset-0 absolute opacity-0 hover:opacity-100 ">
          <i className="fas fa-edit"></i>
                                                                                                              hello, {name}
        </div>
        {profileImage && <img className="h-full m-auto " src={profileImage} alt={name} />}
      </Module>
    )
  } else {
    return <div>loading...</div>
  }

}
