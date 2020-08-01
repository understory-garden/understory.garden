import auth from 'solid-auth-client'
import FileClient from 'solid-file-client'

export const newClient = () => new FileClient(auth)
