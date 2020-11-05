import { useState } from 'react'

import Link from 'next/link'

import { useAuthentication, useLoggedIn } from 'swrlit'

const links = [
  { href: 'https://github.com/vercel/next.js', label: 'GitHub' },
  { href: 'https://nextjs.org/docs', label: 'Docs' },
]

function LoginUI(){
  const [handle, setHandle] = useState("")
  const [badHandle, setBadHandle] = useState(false)
  const { loginHandle, logout } = useAuthentication()
  const loggedIn = useLoggedIn()
  async function logIn(){
    setBadHandle(false)
    try {
      await loginHandle(handle);
    } catch (e) {
      console.log("error:", e)
      setBadHandle(true)
    }
  }
  function onChange(e){
    setHandle(e.target.value)
    setBadHandle(false)
  }
  function onKeyPress(e){
    if (e.key === "Enter"){
      logIn()
    }
  }
  return (
    loggedIn ? (
      <li>
        <button onClick={logout}>log out</button>
      </li>
    ) : (
      <>
        <li className="relative">
          <input type="text" className="pl-2"
                 placeholder="what's your handle?"
                 value={handle} onChange={onChange} onKeyPress={onKeyPress}/>
          {badHandle && (
            <p className="text-xs text-red-500 absolute">
              hm, I don't recognize that handle
            </p>
          )}
        </li>
        <li>
          <button className="btn-blue" onClick={logIn}>log in</button>
        </li>
      </>
    ))
}

export default function Nav() {
  return (
    <nav>
      <ul className="flex justify-between items-center p-8">
        <li>
          <Link href="/">
            <a className="text-blue-500 no-underline">Home</a>
          </Link>
        </li>
        <ul className="flex justify-between items-center space-x-4">
          {links.map(({ href, label }) => (
            <li key={`${href}${label}`}>
              <a href={href} className="btn-blue no-underline">
                {label}
              </a>
            </li>
          ))}
          <LoginUI/>
        </ul>
      </ul>
    </nav>
  )
}
