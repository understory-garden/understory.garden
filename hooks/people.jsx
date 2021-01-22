import { useContext, useEffect } from 'react'
import { useMyProfile, useProfile } from 'swrlit'
import { getUrlAll, getStringNoLocale } from '@inrupt/solid-client'
import { sioc as SIOC } from 'rdf-namespaces'
import { ITME } from '../vocab'

import MonetizationContext from '../contexts/MonetizationContext'

export function useFollows(){
  const { profile } = useMyProfile()
  return profile && getUrlAll(profile, SIOC.follows)
}

export function useProfilePaymentPointer(webId){
  const { profile } = useProfile(webId)
  const { setPaymentPointer } = useContext(MonetizationContext)
  useEffect(function(){
    if (setPaymentPointer){
      const paymentPointer = profile && getStringNoLocale(profile, ITME.paymentPointer)
      if (paymentPointer){
        console.log("setting profile payment pointer for NO SERIOUSLY", paymentPointer)
        setPaymentPointer(paymentPointer)
      }
    }
  }, [setPaymentPointer, profile])
}
