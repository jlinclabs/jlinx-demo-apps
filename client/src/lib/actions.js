import { useState, useCallback } from 'react'

export function useAction(actionId, callbacks = {}){
  const [value, setValue] = useState(null)
  const pending = value instanceof Promise
  const call = (pending
    ? () => {
      console.trace(`already executing`, { actionId })
      throw new Error(`already executing actionId="${actionId}"`)
    }
    : options => {
      const promise = new Promise((resolve, reject) => {
        takeAction(actionId, options).then(resolve, reject)
      }).then(
        result => {
          setValue(result)
          if (callbacks.onSuccess)
            callbacks.onSuccess(result)
        },
        error => {
          setValue(error)
          if (callbacks.onFailure)
            callbacks.onFailure(error)
        },
      )
      setValue(promise)
      return promise
    }
  )

  call.pending = pending
  call.failed = value instanceof Error
  call.success = !call.pending && !call.failed && !!value
  call.error = call.failed ? value : null
  call.result = call.success ? value : null
  return call
}

async function takeAction(actionId, options){
  console.log('TAKE ACTION', actionId, options)
  const response = await fetch(
    `/api/actions/${actionId}`,
    {
      method: 'POST',
      body: JSON.stringify(options),
    }
  )
  const { error, result } = await response.json()
  console.log('useAction RESULT', { actionId, options, result })
  if (error){
    const _error = new Error(error.message)
    if (error.stack) {
      _error.stack = error.stack + '\n' + error.stack
    }
    throw _error
  }
  return result
}
