import { useState } from 'react'
import Nav from '../components/nav'
import { useAuthentication, useLoggedIn } from 'swrlit'

function LoginUI(){
  const [handle, setHandle] = useState("")
  const [badHandle, setBadHandle] = useState(false)
  const { loginHandle, logout } = useAuthentication()
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
    <div className="flex flex-col">
      <input type="text" className="pl-2 w-2/3 m-auto font-logo text-2xl rounded text-center"
             placeholder="what's your handle?"
             value={handle} onChange={onChange} onKeyPress={onKeyPress}/>
      {badHandle && (
        <p className="text-xs text-red-500 m-auto mt-1">
          hm, I don't recognize that handle
        </p>
      )}
      <button className="text-white mt-6 text-3xl font-logo" onClick={logIn}>log in</button>
    </div>
  )
}


export default function IndexPage() {
  const loggedIn = useLoggedIn()

  return (
    <div className="bg-black h-screen">
      <Nav />
      { (loggedIn === true) ? (
        <h1 className="text-6xl text-center bold font-logo text-white">
          ANY QUESTIONS?
        </h1>
      ) : (
        (loggedIn === false) ? (
          <>
            <div className="py-20">
              <h1 className="text-6xl text-center bold font-logo text-white">
                FACE
              </h1>
              <h1 className="text-6xl text-center bold font-logo text-white">
                BABY
              </h1>
            </div>
            <LoginUI/>
          </>
        ) : (
          <></>
        )
      ) }
    </div>
  )
}
