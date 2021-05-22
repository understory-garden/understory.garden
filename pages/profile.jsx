import { useState } from 'react'
import { useMyProfile, useWebId } from 'swrlit'
import Link from 'next/link'
import {
  setStringNoLocale, getStringNoLocale, getUrl, setUrl
} from '@inrupt/solid-client'
import { FOAF } from '@inrupt/vocab-common-rdf'

import Nav from '../components/nav'
import WebMonetization from '../components/WebMonetization'
import { profilePath } from '../utils/uris'
import { useImageUploadUri } from '../hooks/uris'
import { EditIcon } from '../components/icons'
import { ImageUploadAndEditor } from '../components/ImageUploader'
import { getPaymentPointer, setPaymentPointer } from '../model/profile'

function Name({name, save, ...props}){
  const [newName, setNewName] = useState()
  const [editingName, setEditingName] = useState(false)
  function saveName(){
    save(newName)
    setEditingName(false)
  }
  function onEdit(){
    setNewName(name)
    setEditingName(true)
  }
  return (
    <div {...props}>
      {editingName ? (
        <div className="flex flex-row justify-center">
          <input className="text-xl input-text mr-3"
                 value={newName}
                 autoFocus
                 onChange={e => setNewName(e.target.value)} type="text"
                 placeholder="New Name" />
          <button className="btn" onClick={saveName}>
            Set Name
          </button>
        </div>
      ): (
        <div className="relative flex flex-row">
          <h3 className="text-4xl text-center mb-3">{name}</h3>
          <EditIcon className="relative -top-6 text-purple-300 cursor-pointer"
                    onClick={onEdit} />
        </div>
      )}
    </div>
  )
}

function WebMonetizationPointer({profile, save, ...props}){
  const paymentPointer = getPaymentPointer(profile)
  const [newPaymentPointer, setNewPaymentPointer] = useState()
  const [editingPaymentPointer, setEditingPaymentPointer] = useState(false)
  function savePaymentPointer(){
    save(newPaymentPointer)
    setEditingPaymentPointer(false)
  }
  function onEdit(){
    setNewPaymentPointer(paymentPointer)
    setEditingPaymentPointer(true)
  }
  return (
    <div {...props}>
      {editingPaymentPointer ? (
        <div className="flex flex-row justify-center">
          <input className="text-xl input-text mr-3"
                 value={newPaymentPointer}
                 autoFocus
                 onChange={e => setNewPaymentPointer(e.target.value)} type="text"
                 placeholder="New Payment Pointer" />
          <button className="btn" onClick={savePaymentPointer}>
            Set PaymentPointer
          </button>
        </div>
      ): (
        <div className="relative flex flex-row">
          <h3 className="text-xl text-center mb-3">
            {paymentPointer || (
              <span className="text-gray-500" onClick={onEdit}>
                click to set payment pointer
              </span>
            )}
          </h3>
          {paymentPointer && (
            <EditIcon className="relative -top-6 text-purple-300 cursor-pointer"
                      onClick={onEdit} />
          )}
        </div>
      )}
    </div>
  )
}

function ProfileImage({profile, save, ...props}){
  const profileImage = profile && getUrl(profile, FOAF.img)
  const [editingProfileImage, setEditingProfileImage] = useState(false)
  const webId = useWebId()
  const imageUploadContainer = useImageUploadUri(webId)
  function saveProfileImage(newProfileImageUri){
    save(new URL(newProfileImageUri, webId).toString())
    setEditingProfileImage(false)
  }
  function onEdit(){
    setEditingProfileImage(true)
  }
  return (
    <div {...props}>
      {editingProfileImage ? (
        <div className="flex flex-row justify-center">
          <ImageUploadAndEditor onSave={saveProfileImage}
                                imageUploadContainerUri={imageUploadContainer}
                                onClose={() => setEditingProfileImage(false)} />
        </div>
      ): (
        <div className="relative flex flex-row">
          {profileImage && <img className="rounded-full h-36 w-36 object-cover mr-12" src={profileImage} /> }
          <EditIcon className="relative -top-6 text-purple-300 cursor-pointer"
                    onClick={onEdit} />
        </div>
      )}
    </div>
  )
}

export default function Profile(){
  const { profile, save: saveProfile } = useMyProfile()
  const name = profile && getStringNoLocale(profile, FOAF.name)
  const profileImage = profile && getUrl(profile, FOAF.img)
  async function onSaveName(newName){
    return await saveProfile(setStringNoLocale(profile, FOAF.name, newName))
  }
  async function onSavePaymentPointer(newPaymentPointer){
    return await saveProfile(setPaymentPointer(profile, newPaymentPointer))
  }
  async function onSaveProfileImage(newProfileImage){
    return await saveProfile(setUrl(profile, FOAF.img, newProfileImage))
  }

  const webId = useWebId()
  const [tab, setTab] = useState("notes")

  return (
    <div className="page">
      <WebMonetization webId={webId}/>
      <Nav />
      <div className="px-6">
        <div className="flex flex-row py-6 justify-between">
          <div className="flex flex-row">
            { profile && <ProfileImage profile={profile} save={onSaveProfileImage} /> }
            <div className="flex flex-col mr-12">
              <Name name={name} save={onSaveName}/>
              <WebMonetizationPointer profile={profile} save={onSavePaymentPointer}
                                      className="mt-2"/>
            </div>
          </div>
          <div className="flex flex-col">
            <h5 className="text-xl text-center mb-6">
              <Link href={`${profilePath(webId)}`}>
                <a>
                  public profile
                </a>
              </Link>
            </h5>
          </div>
        </div>
      </div>
    </div>
  )
}
