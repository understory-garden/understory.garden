import ReactLoader from 'react-loader-spinner'
import auth from "solid-auth-client"

import Button from "./Button"
import useWebId from "~hooks/useWebId"

export const Loader = () => <ReactLoader type="Puff" color="white" />

export function AuthButton() {
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
    return <Button onClick={() => auth.logout()}>Log Out</Button>
  }
}


export { Button }
