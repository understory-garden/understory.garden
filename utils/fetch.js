import { fetch } from 'solid-auth-fetcher'

export async function postFormData(uri, body){
  const formBody = [];
  for (var key in body) {
    const encodedKey = encodeURIComponent(key)
    const encodedValue = encodeURIComponent(body[key])
    formBody.push(encodedKey + "=" + encodedValue)
  }

  return fetch(uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: formBody.join("&")
  })

}

const SolidServerURI = "https://coop.itme.host"

export async function sendMagicLink(username, email) {
  const magicLinkURI = SolidServerURI + "/magic-link/generate"
  console.log("Sending magic link to " + email)
  return postFormData(magicLinkURI, {
    username, email,
    returnToUrl: `https://itme.online/login/${username}.coop.itme.host`
  })
}

export async function deleteResource(uri){
  return fetch(uri, {
    method: 'DELETE',
  })

}
