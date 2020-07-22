import HomeSpace from "../spaces/Home"
import LoginSpace from "../spaces/Login"
import LoadingSpace from "../spaces/Loading"
import { useWebId } from '~hooks'


export default function Home() {
  const webId = useWebId()
  return (
    <div className="container">
      <main>
        {webId === undefined ? (
          <LoadingSpace />
        ) : (
            webId === null ? (
              <LoginSpace />
            ) : (
                <HomeSpace />
              )
          )}
      </main>
      <footer>

      </footer>
    </div>
  )
}
