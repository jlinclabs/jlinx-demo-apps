import { useState, useCallback } from 'react'

export default function useStateObject(init = {}){
  const [value, setValue] = useState(init)
  const onChange = useCallback(
    changes => {
      onChange.value = {
        ...onChange.value,
        ...changes
      }
      setValue(onChange.value)
    },
    [setValue]
  )
  onChange.value = value
  return [value, onChange]
}
