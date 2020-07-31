import React, { createContext, useContext } from 'react';
import auth, { Session } from 'solid-auth-client';
import { useRouter } from 'next/router'

async function logIn() {
  return await auth.popupLogin({ popupUri: "/popup.html" })
}
async function logOut() {
  return await auth.logout()
}

export const AuthContext = createContext({ logIn, logOut })

const { Provider } = AuthContext;

export const AuthProvider = (props) => {
  const router = useRouter()

  async function logOutAndGoHome() {
    await logOut()
    router.push("/")
  }

  async function logInAndGoHome() {
    await logIn()
    router.push("/")
  }
  return (
    <Provider {...props} value={{ logIn: logInAndGoHome, logOut: logOutAndGoHome }} />
  )
}

export const useAuthContext = () => useContext(AuthContext)
