import { foaf, vcard } from 'rdf-namespaces'
import {
  setStringNoLocale, getStringNoLocaleOne, getUrlOne
} from '@solid/lit-pod'

import useWebId from "~hooks/useWebId"
import useThing from "~hooks/useThing"
import { Module } from "~components/layout"
import { Loader } from "~components/elements"

import { EditableText } from "~components/editable"
import { otherPath } from "~lib/urls"



export default function Profile() {
  const webId = useWebId()
  const { thing: profile, save: saveProfile } = useThing(webId)
  const name = profile && getStringNoLocaleOne(profile, foaf.name)
  const profileImage = profile && getUrlOne(profile, vcard.hasPhoto)
  const saveName = async newName => {
    saveProfile(setStringNoLocale(profile, foaf.name, newName))
  }
  return (
    <Module>
      {profile ? (
        <>
          <div className="inset-0 p-6 absolute bg-opacity-75 bg-white opacity-0 hover:opacity-100 prose">
            <h3>
              hello, <EditableText save={saveName} value={name} placeholder="name">{name}</EditableText>
            </h3>
            <a href={otherPath(webId)}><h4>Public Profile</h4></a>
          </div>
          {profileImage && <img className="h-full m-auto" src={profileImage} alt={name} />}
        </>
      ) : (
          <Loader />
        )
      }
    </Module>
  )
}
