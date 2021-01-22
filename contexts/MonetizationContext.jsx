import { useState, useEffect, createContext } from 'react'
import { useRouter } from 'next/router'


const MonetizationContext = createContext({paymentPointer: null})

const { Provider, Consumer } = MonetizationContext

export const MonetizationConsumer = Consumer

export function MonetizationProvider(props){
  const [paymentPointer, setPaymentPointer] = useState(null)
  const router = useRouter()
  useEffect(function(){
    const handleRouteChangeComplete = () => {
      console.log("ROUTE CHANGE COMPLETE")
    }
    router.events.on('routeChangeComplete', handleRouteChangeComplete)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete)
    }
  }, [])
  return (
    <Provider value={ { paymentPointer, setPaymentPointer } } {...props} />
  )
}

export default MonetizationContext
