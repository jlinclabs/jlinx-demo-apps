import { useView } from '../lib/views'

export function useCeramicStreamEvents(id){
  const { view: events, ...state } = useView(id ? `ceramic.events.${id}` : null)
  return [events, state]
}
