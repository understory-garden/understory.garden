import { forwardRef } from 'react'
import ReactLoader from 'react-loader-spinner'
import auth from "solid-auth-client"
import NextLink from 'next/link'
import {
  getUrlAll, getUrl, getStringNoLocale
} from '@itme/solid-client'
import { foaf, vcard } from "rdf-namespaces"

import Button from "./Button"
import useWebId from "~hooks/useWebId"
import { useThing } from "~/hooks"
import { useAuthContext } from '~lib/auth'
import { otherPath } from "~lib/urls"

export const Loader = (props) => <ReactLoader type="Puff" color="white" {...props} />

export function AuthButton() {
  const { logOut } = useAuthContext()
  const webId = useWebId()
  if (webId === undefined) {
    return <div><Loader /></div>
  } else if (webId === null) {
    return (
      <Button onClick={() => auth.popupLogin({ popupUri: "/popup.html" })}>
        Log In
      </Button>
    )
  } else {
    return <Button onClick={() => logOut()}>Log Out</Button>
  }
}

export const Link = forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <NextLink {...props} >
      <a ref={ref} className={`font-semibold lowercase text-pink-900 no-underline ${className}`}>{children}</a>
    </NextLink>
  )
})

export function Avatar({ webId, ...rest }) {
  const { thing: profile } = useThing(webId)
  const profileImage = profile && getUrl(profile, vcard.hasPhoto)
  const name = profile && getStringNoLocale(profile, foaf.name)
  return (
    <div className="relative col-span-3" {...rest}>
      <a href={otherPath(webId)} >
        <img className="h-16 w-16 color-white overflow-hidden rounded-full"
          alt="profile"
          src={profileImage || '/user.svg'} />
        <div className="p-6 h-16 w-16 top-0 left-0 hover:w-32 hover:h-32 absolute hover:-top-8 hover:-left-8 rounded-full text-center bg-opacity-75 bg-white opacity-0 hover:opacity-100 align-baseline flex flex-column items-center transition-transform duration-100 ease-in-out transform hover:-translate-y-1 hover:scale-110 ">
          <h4>{name}</h4>
        </div>
      </a>
    </div>
  )
}

export { Button }
