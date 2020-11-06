import { useState } from 'react'

import Link from 'next/link'

import { useAuthentication, useLoggedIn } from 'swrlit'

export default function Nav() {
  const loggedIn = useLoggedIn()
  const { logout } = useAuthentication()
  return (
    <nav>
      <ul className="flex justify-between items-center p-8">
        <ul className="flex justify-between items-center space-x-4">
          {loggedIn && (
            <li>
              <button className="text-white" onClick={logout}>log out</button>
            </li>
          )}
        </ul>
      </ul>
    </nav>
  )
}
