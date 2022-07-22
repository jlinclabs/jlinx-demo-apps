import fetch from 'node-fetch'

export async function postJSON(url, body){
  console.log({ url, body })
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  if (!response.ok){
    throw new Error(`post json failed url=${url}`)
  }
  return await response.json()
}
