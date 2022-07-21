import { useCallback } from 'react'
import useSWR, { useSWRConfig } from 'swr'

const viewIdToSwrKey = viewId => viewId ? `/api/views/${viewId}` : undefined

export function useView(viewId){
  const swrKey = viewIdToSwrKey(viewId)
  const { data: view, error, mutate } = useSWR(swrKey, fetchView)
  const loading = typeof view === 'undefined'
  const reload = useCallback(() => { mutate(swrKey) }, [swrKey, mutate])
  return { view, loading, error, mutate, reload }
}

export function useReloadView(viewId){
  const swrKey = viewIdToSwrKey(viewId)
  const { mutate } = useSWRConfig()
  return useCallback(() => { mutate(swrKey) }, [swrKey, mutate])
}

async function fetchView(url){
  const res = await fetch(url)
  const data = await res.json()
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    error.info = data
    error.status = res.status
    throw error
  }
  return data.value
}
