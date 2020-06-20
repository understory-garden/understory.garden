import React from 'react'
import { act, render, waitForElementToBeRemoved } from '@testing-library/react'
import auth from "solid-auth-cli"

import useObject from '../hooks/useObject'

const Name = () => {
  const { object, loading, error } = useObject("https://tvachon.inrupt.net/profile/card#me", {}, {fetch: auth.fetch})
  return (object ? <h1>{object.name}</h1> : <h5>Loading...</h5>)
}



test('loads an object', async () => {
  await act(async() => {
    const { getByText } = render(<Name />)
    await waitForElementToBeRemoved(() => getByText("Loading..."), {timeout: 10000})
    getByText("Lord Vacon")
  })
})
