import { fetch } from 'solid-auth-fetcher'

export async function postFormData(uri, body){
  const formBody = [];
  for (var key in body) {
    const encodedKey = encodeURIComponent(key)
    const encodedValue = encodeURIComponent(body[key])
    formBody.push(encodedKey + "=" + encodedValue)
  }

  const response = await fetch(uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: formBody.join("&")
  })
}
