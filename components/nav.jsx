import { useState } from 'react'
import Link from 'next/link'

import { getUrl } from '@inrupt/solid-client'
import { FOAF, LDP } from '@inrupt/vocab-common-rdf'

import { useAuthentication, useLoggedIn, useMyProfile, useContainer } from 'swrlit'
import { MailIcon } from '../components/icons'

export default function Nav() {
  const loggedIn = useLoggedIn()
  const { logout } = useAuthentication()
  const { profile } = useMyProfile()
  const profileImage = profile && getUrl(profile, FOAF.img)
  const inboxUri = profile && getUrl(profile, LDP.inbox)
  const { resources } = useContainer(inboxUri)
  const hasMessages = resources && (resources.length > 0)
  return (
    <nav className="pt-3">
      <ul className="flex justify-between items-center">
        <Link href="/">
          <a className="font-bold text-3xl">👶</a>
        </Link>
        <ul className="flex justify-between items-center space-x-4">
          {loggedIn && (
            <Link href="/messages">
              <a className="text-white">
                <div className="relative">
                  <MailIcon className="w-12"/>
                  {hasMessages && (
                    <div className="absolute top-0 right-0 block h-5 w-5 rounded-full ring-2 ring-white bg-red-400 pl-2 leading-3 pt-0.5">
                      { resources.length }
                    </div>
                  )}
                </div>
              </a>
            </Link>
          )}
          {profileImage && <img src={profileImage} className="rounded-full h-12 w-12 object-cover" />}
          {loggedIn && (
            <li>
              <button onClick={logout}>log out</button>
            </li>
          )}
        </ul>
      </ul>
    </nav>
  )
}
