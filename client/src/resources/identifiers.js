import { useAction } from '../lib/actions'
import { useView, useReloadView } from '../lib/views'

export function useCreateIdentifier(callbacks){
  const reloadMyIdentifiers = useReloadMyIdentifiers()
  return useAction('identifiers.create', {
    ...callbacks,
    onSuccess(idenitifier){
      reloadMyIdentifiers()
      if (callbacks.onSuccess) callbacks.onSuccess(idenitifier)
    },
  })
}

export function useIdentifier(did){
  const { view: identifier, ...state } = useView(`identifiers.${did}`)
  return [identifier, state]
}

export function useReloadMyIdentifiers(){
  return useReloadView(`identifiers.mine`)
}
export function useMyIdentifiers(){
  const { view: myIdentifiers, ...state } = useView(`identifiers.mine`)
  return [myIdentifiers, state]
}
