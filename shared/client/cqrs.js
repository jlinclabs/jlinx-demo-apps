import { useRef, useState, useCallback } from 'react'
import useSWR, { useSWRConfig } from 'swr'

export async function fetchQuery(name, options = {}){
  const params = new URLSearchParams(options)
  return await apiFetch('GET', `/api/${name}?${params}`)
}

export async function fetchCommand(name, options){
  return await apiFetch('POST', `/api/${name}`, options)
}

window.cqrs = {
  query: fetchQuery,
  command: fetchCommand,
}

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
  const { result, error } = await res.json()
  if (error) throw new Error(error.message)
  return result || null
}

const wait = ms => new Promise(resolve => {
  setTimeout(() => { resolve() }, ms)
})


export function useQuery(name, options = {}){
  const swrKey = name ? [name, options] : null
  const { data: result, error, mutate } = useSWR(swrKey, fetchQuery)
  const loading = typeof result === 'undefined' && !error
  const reload = useCallback(() => { mutate() }, [mutate])
  return { result, loading, error, mutate, reload }
}
