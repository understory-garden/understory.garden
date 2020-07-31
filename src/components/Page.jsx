import { Link } from '~components/elements'
import { HomeIcon, CircleWithCrossIcon } from '~components/icons'
import { AuthProvider, useAuthContext } from '~lib/auth'
import { useWebId } from "~/hooks"

export default function Page({ children }) {
  const webId = useWebId()
  const { logOut } = useAuthContext()
  return (
    <AuthProvider>
      <div className="bg-gradient-tl-background w-screen min-h-screen">
        {webId && (
          <nav className="mx-12 mb-2 py-2 bg-white bg-opacity-25 module-border border-8 rounded-lg relative -top-2 flex flex-row justify-between">
            <Link href="/"><HomeIcon className="h-5 px-2 module-border border-r-2" /></Link>

            <CircleWithCrossIcon className="h-5 px-2 text-pink-900 module-border border-l-2 cursor-pointer module-border" onClick={() => logOut()} />
          </nav>
        )}
        {children}
      </div>
    </AuthProvider>
  )
}
