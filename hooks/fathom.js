import { useEffect } from 'react'
import * as fathom from '../model/fathom';
import { useRouter } from 'next/router'


export function useFathom() {
  const router = useRouter()
  return useEffect(() => {
    fathom.load()

    function onRouteChangeComplete() {
      fathom.trackPageview()
    }
    // Record a pageview when route changes
    router.events.on('routeChangeComplete', onRouteChangeComplete)
    // Unassign event listener
    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete)
    }
  }, [])
}
