import { useEffect, useCallback } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import useAsync from './hooks/useAsync'

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

export function useCommand(name, config){
  return useAsync(
    options => fetchCommand(name, options),
    config
  )
}

export function useCommandOnMount(name, options, config){
  const command = useCommand(name, config)
  useEffect(
    () => { if (command.idle) command.call(options) },
    [name, options]
  )
  return command
}

// export function useRemoteCommand(name, callbacks = {}){
//   const [value, setValue] = useState(null)
//   const returnObjectRef = useRef({})
//   const ro = returnObjectRef.current
//   ro.pending = value instanceof Promise
//   ro.call = useCallback(ro.pending
//     ? () => {
//       console.trace(`already executing`, { name })
//       throw new Error(`already executing name="${name}"`)
//     }
//     : options => {
//       const promise = new Promise((resolve, reject) => {
//         rpc(name, options).then(resolve, reject)
//       }).then(
//         result => {
//           setValue(result)
//           if (callbacks.onSuccess)
//             callbacks.onSuccess(result)
//         },
//         error => {
//           setValue(error)
//           if (callbacks.onFailure)
//             callbacks.onFailure(error)
//         },
//       )
//       setValue(promise)
//       return promise
//     },
//     [ro.pending, callbacks.onSuccess, callbacks.onFailure]
//   )
//   ro.failed = value instanceof Error
//   ro.success = !ro.pending && !ro.failed && !!value
//   ro.error = ro.failed ? value : null
//   ro.result = ro.success ? value : null
//   return ro
// }
