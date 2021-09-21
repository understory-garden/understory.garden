import { useEffect } from "react";
import "../styles/index.css";
import "cropperjs/dist/cropper.css";
import {
  AuthenticationProvider,
  useWebId,
  useResource,
  useAuthentication,
  useLoggedIn,
} from "swrlit";
import Head from "next/head";
import { useRouter } from "next/router";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SWRConfig } from "swr";
import { useFathom } from "../hooks/fathom";
import { getUrl } from "@inrupt/solid-client";
import { SOLID } from "@inrupt/vocab-solid";

function AuthValidator() {
  // makes a dummy request to a known private resource.
  // If the resource can't be reached because of a 401, logout
  const webId = useWebId();
  const privateTypeIndex = webId && getUrl(webId, SOLID.privateTypeIndex);
  const { error } = useResource(privateTypeIndex);
  const { logout } = useAuthentication();
  useEffect(
    function () {
      if (error && error.statusCode == 401) {
        logout();
      }
    },
    [error && error.statusCode]
  );
  return <></>;
}

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  // disable to debug issues in staging
  useFathom();
  const loggedIn = useLoggedIn();
  return (
    <>
      <Head>
        <link rel="stylesheet" href="https://use.typekit.net/ydt0qut.css" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap"
          rel="stylesheet"
        />
        {/* Temporary Logo Wordmark Font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Bellota:wght@700&display=swap"
          rel="stylesheet"
        />
        <meta name="monetization" content="$ilp.uphold.com/DYPhbXPmDa2P" />
      </Head>
      <SWRConfig value={{ shouldRetryOnError: false }}>
        <DndProvider backend={HTML5Backend}>
          <AuthenticationProvider>
            {loggedIn && <AuthValidator />}
            <Component {...pageProps} />
          </AuthenticationProvider>
        </DndProvider>
      </SWRConfig>
    </>
  );
}

export default MyApp;
