import { useEffect } from 'react'
import '../styles/index.css'
import "cropperjs/dist/cropper.css";
import { AuthenticationProvider } from 'swrlit'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { SWRConfig } from 'swr'
import * as Fathom from 'fathom-client'

function MyApp({ Component, pageProps }) {
  const router = useRouter()

  useEffect(() => {
    // Initialize Fathom when the app loads
    Fathom.load('TMUOYFGA', {
      includedDomains: ['understory.garden'],
    })

    Fathom.load('TGJRMEAN', {
      includedDomains: ['staging.understory.garden'],
    })

    function onRouteChangeComplete() {
      Fathom.trackPageview()
    }
    // Record a pageview when route changes
    router.events.on('routeChangeComplete', onRouteChangeComplete)

    // Unassign event listener
    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete)
    }
  }, [])

  return (
    <>
      <Head>
        <link rel="stylesheet" href="https://use.typekit.net/ydt0qut.css" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <meta name="monetization" content="$ilp.uphold.com/DYPhbXPmDa2P" />
      </Head>
      <SWRConfig value={{ shouldRetryOnError: false }}>
        <DndProvider backend={HTML5Backend}>
          <AuthenticationProvider>
            <Component {...pageProps} />
          </AuthenticationProvider>
        </DndProvider>
      </SWRConfig>
    </>
  )
}

export default MyApp
