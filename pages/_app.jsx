import '../styles/index.css'
import "cropperjs/dist/cropper.css";
import { AuthenticationProvider } from 'swrlit'
import Head from 'next/head'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="https://use.typekit.net/fgi5twt.css"/>
      </Head>
      <DndProvider backend={HTML5Backend}>
        <AuthenticationProvider>
          <Component {...pageProps} />
        </AuthenticationProvider>
      </DndProvider>
    </>
  )
}

export default MyApp
