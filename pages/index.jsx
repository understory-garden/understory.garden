import Head from 'next/head'

import HomeSpace from "../spaces/Home"


export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
        <script src="https://kit.fontawesome.com/a1d1182be4.js" crossorigin="anonymous" />
      </Head>

      <main>
        <HomeSpace />
      </main>
      <footer>

      </footer>
    </div>
  )
}
