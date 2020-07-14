import Head from 'next/head'

import HomeSpace from "../spaces/Home"


export default function Home() {
    return (
        <div className="container">
            <Head>
                <title>Create Next App</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <HomeSpace />
            </main>
            <footer>

            </footer>
        </div>
    )
}
