import { useEffect, useState } from 'react'
import { useAuthentication } from 'swrlit'
import { useRouter } from 'next/router'

export default function Login(){
  const router = useRouter()
  const { handle } = router.query
  console.log("HANDLE", handle)
  const { session, loginHandle } = useAuthentication()
  const [loggingIn, setLoggingIn] = useState(false)
  useEffect(function logUserIn(){
    if (handle && !loggingIn && session){
      console.log(session)
      if (session.loggedIn) {
        router.replace("/")
      } else if (session) {
        setLoggingIn(true)
        console.log("LOGGING IN", handle)
        loginHandle(handle)
      }
    }
  }, [loginHandle, session, handle])
  return (
    <div></div>
  )
}
