import { useState, useCallback, useEffect } from 'react'

const noop = () => {}

export default function useForceUpdate(){
  let setState = useState()[1]
  useEffect(() => () => { setState = noop }, [])
  return useCallback(() => { setState({}) }, [])
}
