import { useAction } from '../lib/actions'
import { useView, useReloadView } from '../lib/views'

export function useCreateProfile(callbacks){
  const reloadMyProfiles = useReloadMyProfiles()
  return useAction('profiles.create', {
    ...callbacks,
    onSuccess(idenitifier){
      reloadMyProfiles()
      if (callbacks.onSuccess) callbacks.onSuccess(idenitifier)
    },
  })
}

export function useUpdateProfile(callbacks){
  const reloadMyProfiles = useReloadMyProfiles()
  return useAction('profiles.update', {
    ...callbacks,
    onSuccess(idenitifier){
      reloadMyProfiles()
      if (callbacks.onSuccess) callbacks.onSuccess(idenitifier)
    },
  })
}


export function useProfile(did){
  const { view: profile, ...state } = useView(`profiles.${did}`)
  return [profile, state]
}

export function useReloadMyProfiles(){
  return useReloadView(`profiles.mine`)
}

export function useMyProfiles(){
  const { view: myProfiles, ...state } = useView(`profiles.mine`)
  return [myProfiles, state]
}
