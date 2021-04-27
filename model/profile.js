import { getStringNoLocale, setStringNoLocale } from '@inrupt/solid-client'
import { US, PP } from '../vocab'

export function getPaymentPointer(profile) {
  return profile && (getStringNoLocale(profile, US.paymentPointer) || getStringNoLocale(profile, PP.paymentPointer))
}

export function setPaymentPointer(profile, newPaymentPointer) {
  return setStringNoLocale(profile, PP.paymentPointer, newPaymentPointer)
}