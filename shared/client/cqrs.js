const cqrs = {
  async query(name, options = {}){
    const params = new URLSearchParams(options)
    return await apiFetch('GET', `/api/${name}?${params}`)
  },
  async command(name, options){
    return await apiFetch('POST', `/api/${name}`, options)
  }
}

window.cqrs = cqrs

async function apiFetch(method, path, body, tries = 0){
  const res = await fetch(path, {
    method,
    headers: {
      'Accepts': 'application/json',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 504 && tries < 5) {
    await wait(500)
    return apiFetch(method, path, body, tries + 1)
  }
  return await res.json()
}

const wait = ms => new Promise(resolve => {
  setTimeout(() => { resolve() }, ms)
})
