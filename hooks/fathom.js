import * as Fathom from 'fathom-client'

export function useFathom() {
  return useEffect(() => {
    // Initialize Fathom when the app loads
    Fathom.load('TMUOYFGA', {
      includedDomains: ['understory.garden'],
    })
    Fathom.load('TGJRMEAN', {
      includedDomains: ['staging.understory.garden'],
    })
    function onRouteChangeComplete() {
      Fathom.trackPageview()
    }
    // Record a pageview when route changes
    router.events.on('routeChangeComplete', onRouteChangeComplete)
    // Unassign event listener
    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete)
    }
  }, [])
}
