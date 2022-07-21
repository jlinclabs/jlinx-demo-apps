
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAction } from '../lib/actions'
import { useView, useReloadView } from '../lib/views'

export function useCurrentUser({
  redirectToIfFound,
  redirectToIfNotFound,
} = {}) {
  const navigate = useNavigate()
  const { view: currentUser, loading, error, mutate } = useView('session.currentUser')

  useEffect(
    () => {
      if (loading) return
      if (redirectToIfFound && currentUser){
        navigate(redirectToIfFound)
      }else if (redirectToIfNotFound && !currentUser){
        navigate(redirectToIfNotFound)
      }
    },
    [
      navigate,
      loading,
      currentUser,
      redirectToIfFound,
      redirectToIfNotFound
    ]
  )
  const reload = () => { mutate() }
  console.log('useCurrentUser', { currentUser })
  return { currentUser, loading, error, mutate, reload }
}

export function useReloadCurrentUser(){
  return useReloadView('session.currentUser')
}

function useActionAndReloadCurrentUser(action, callbacks = {}){
  const reloadCurrentUser = useReloadCurrentUser()
  return useAction(action, {
    ...callbacks,
    onSuccess(result){
      reloadCurrentUser()
      if (callbacks.onSuccess) callbacks.onSuccess(result)
    },
  })
}
export const useLogin = callbacks =>
  useActionAndReloadCurrentUser('session.login', callbacks)

export const useLogout = callbacks =>
  useActionAndReloadCurrentUser('session.logout', callbacks)

export const useSignup = callbacks =>
  useActionAndReloadCurrentUser('session.signup', callbacks)
