import { foaf, vcard } from 'rdf-namespaces'
import {
  setStringNoLocale, getStringNoLocaleOne, getUrlOne
} from '@solid/lit-pod'

import useWebId from "~hooks/useWebId"
import useThing from "~hooks/useThing"
import { Module } from "~components/layout"

import { EditableText } from "~components/editable"



export default function Profile() {
  const webId = useWebId()
  const { thing: profile, save: saveProfile } = useThing(webId)
  const name = profile && getStringNoLocaleOne(profile, foaf.name)
  const profileImage = profile && getUrlOne(profile, vcard.hasPhoto)
  const saveName = async newName => {
    saveProfile(setStringNoLocale(profile, foaf.name, newName))
  }
  if (profile) {
    return (
      <Module>
        <div className="inset-0 absolute bg-opacity-75 bg-white opacity-0 hover:opacity-100 ">
          <h3 className="p-6">
            hello, <EditableText save={saveName} value={name} placeholder="name">{name}</EditableText>
          </h3>
        </div>
        {profileImage && <img className="h-full m-auto" src={profileImage} alt={name} />}
      </Module>
    )
  } else {
    return <div>loading...</div>
  }

}
