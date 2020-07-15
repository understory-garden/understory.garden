import Head from 'next/head'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css' // Import the CSS
config.autoAddCss = false // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

import '../styles.css';

function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>itme.online</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://use.typekit.net/fgi5twt.css" />
        <script src="https://kit.fontawesome.com/a1d1182be4.js" crossOrigin="anonymous" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default App;
