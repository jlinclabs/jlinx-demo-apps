import { useAction } from '../lib/actions'
import { useView } from '../lib/views'

export function useOfferContract(callbacks){
  return useAction('contracts.offer', callbacks)
}

export function useContract(id){
  const { view: contract, ...state } = useView(`contracts.${id}`)
  return [contract, state]
}

export function useMyContracts(){
  const { view: myContracts, ...state } = useView(`contracts.mine`)
  return [myContracts, state]
}

export function useSignContract(callbacks){
  return useAction('contracts.sign', callbacks)
}

export function useAckContractSignature(callbacks){
  return useAction('contracts.ackSignature', callbacks)
}
