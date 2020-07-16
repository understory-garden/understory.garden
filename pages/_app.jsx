import Head from 'next/head'

import '../styles.css';

function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>itme.online</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://use.typekit.net/fgi5twt.css" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default App;
