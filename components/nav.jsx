import { useState } from 'react'
import Link from 'next/link'

import { getUrl } from '@inrupt/solid-client'
import { FOAF } from '@inrupt/vocab-common-rdf'

import { useAuthentication, useLoggedIn, useMyProfile } from 'swrlit'

export default function Nav() {
  const loggedIn = useLoggedIn()
  const { logout } = useAuthentication()
  const { profile } = useMyProfile()
  const profileImage = profile && getUrl(profile, FOAF.img)
  return (
    <nav className="pt-3">
      <ul className="flex justify-between items-centeree">
        <Link href="/">
          <a className="font-bold text-3xl">👶</a>
        </Link>
        <ul className="flex justify-between items-center space-x-4">
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
