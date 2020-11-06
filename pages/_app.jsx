import '../styles/index.css'
import { AuthenticationProvider } from 'swrlit'
import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="https://use.typekit.net/nmi0hpt.css"/>
      </Head>
      <AuthenticationProvider>
        <Component {...pageProps} />
      </AuthenticationProvider>
    </>
  )
}

export default MyApp
