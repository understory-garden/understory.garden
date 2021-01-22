import { useContext } from 'react'
import MonetizationContext from '../contexts/MonetizationContext'


export default function MonetizationMeta({defaultPaymentPointer}){
  console.log("PAYMENT POINTER", paymentPointer)
  return (
    <meta name="monetization" content={paymentPointer || defaultPaymentPointer} />
  )
}
