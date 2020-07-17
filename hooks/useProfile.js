import useWebId from "~hooks/useWebId"
import useThing from "~hooks/useThing"

export default function useProfile() {
  const webId = useWebId()
  const { thing: profile, ...rest } = useThing(webId)
  return { profile, ...rest }
}
