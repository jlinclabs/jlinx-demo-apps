import * as React from 'react'
import { useState, useCallback, useEffect } from 'react'
import useForceUpdate from './useForceUpdate'

const STATES = ['idle', 'pending', 'resolved', 'rejected']
export default function useAsync(asyncFunction, config = {}){
  const { callOnMount, onSuccess, onFailure } = config
  const forceUpdate = useForceUpdate()
  const [ctx] = useState({})

  const setState = state => {
    ctx.state = STATES[state]
    STATES.forEach((name, index) => {
      ctx[name] = index === state
    })
    forceUpdate()
  }

  if (ctx.state === undefined) setState(0)

  ctx.call = useCallback(
    (...args) => {
      if (ctx.promise) throw new Error(`already executing`)
      ctx.promise = new Promise((resolve, reject) => {
        asyncFunction(...args).then(resolve, reject)
      }).then(
        async result => {
          delete ctx.promise
          ctx.result = result
          setState(2)
          if (onSuccess) await onSuccess(result)
          return result
        },
        async error => {
          delete ctx.promise
          ctx.error = error
          if (onFailure) await onFailure(error)
          setState(3)
        },
      )
      setState(1)
      return ctx.promise
    },
    [asyncFunction]
  )

  useEffect(
    () => { if (callOnMount && ctx.state === STATES['0']) ctx.call() },
    [ctx.call, callOnMount, ctx.state]
  )

  return ctx
}

console.log('useAsync useAsync  useAsync useAsync useAsync useAsync useAsync ')
