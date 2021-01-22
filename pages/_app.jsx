import { useContext } from 'react'
import '../styles/index.css'
import "cropperjs/dist/cropper.css";
import { AuthenticationProvider } from 'swrlit'
import Head from 'next/head'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import MonetizationContext, { MonetizationProvider } from '../contexts/MonetizationContext'
import MonetizationMeta from '../components/MonetizationMeta'

// itme's uphold USD payment pointer
const defaultPaymentPointer = "$ilp.uphold.com/DYPhbXPmDa2P"

function MyApp({ Component, pageProps }) {
  const { paymentPointer } = useContext(MonetizationContext)
  console.log("PAYMENT POINTER", paymentPointer)

  return (
    <MonetizationProvider>
      <Head>
        <link rel="stylesheet" href="https://use.typekit.net/fgi5twt.css"/>
      </Head>
      <DndProvider backend={HTML5Backend}>
        <AuthenticationProvider>
          <Component {...pageProps} />
        </AuthenticationProvider>
      </DndProvider>
    </MonetizationProvider>
  )
}

export default MyApp
