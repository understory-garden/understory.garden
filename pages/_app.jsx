import Head from 'next/head'

import '../styles.css';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import 'cropperjs/dist/cropper.css';

function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>itme.online</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://use.typekit.net/fgi5twt.css" />
        <meta name="monetization" content="$ilp.uphold.com/fR3aBhBwnnjy" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default App;
