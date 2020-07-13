import {useState} from "react"
import { foaf, vcard } from 'rdf-namespaces'
import {
  fetchLitDataset, getThingOne, getStringNoLocaleOne, getUrlAll, removeUrl, addUrl,
  saveLitDatasetAt, setThing, getUrlOne
} from '@solid/lit-pod'

import useWebId from "../hooks/useWebId"
import useThing from "../hooks/useThing"
import {Space, Flow, Module} from "../components/layout"

export default function Profile(){
  const webId = useWebId()
  const {thing: profile, save: saveProfile} = useThing(webId)
  const name = profile && getStringNoLocaleOne(profile, foaf.name)
  const profileImage = profile && getUrlOne(profile, vcard.hasPhoto)
  const [saving, setSaving] = useState(false)
  if (profile){
    return (
      <Module>
        <div>
          hello, {name}
        </div>
        {profileImage && <img src={profileImage}/>}
      </Module>
    )
  } else {
    return <div>loading...</div>
  }

}
