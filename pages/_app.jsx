import '../styles/index.css'
import { AuthenticationProvider } from 'swrlit'
import Head from 'next/head'
import { DndProvider } from 'react-dnd'
import DndBackend from 'react-dnd-html5-backend'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="https://use.typekit.net/nmi0hpt.css"/>
      </Head>
      <DndProvider backend={DndBackend}>
        <AuthenticationProvider>
          <Component {...pageProps} />
        </AuthenticationProvider>
      </DndProvider>
    </>
  )
}

export default MyApp
