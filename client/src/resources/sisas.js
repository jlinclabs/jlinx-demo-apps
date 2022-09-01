import { useAction } from '../lib/actions'
import { useView } from '../lib/views'

export function useOfferSisa(callbacks){
  return useAction('sisas.offer', callbacks)
}

export function useSisa(id){
  const { view: sisa, ...state } = useView(`sisas.${id}`)
  return [sisa, state]
}

export function useMySisas(){
  const { view: mySisas, ...state } = useView(`sisas.mine`)
  return [mySisas, state]
}

export function useSignSisa(callbacks){
  return useAction('sisas.sign', callbacks)
}

export function useAckSisaSignature(callbacks){
  return useAction('sisas.ackSignature', callbacks)
}
