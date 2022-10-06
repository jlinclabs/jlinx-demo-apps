import { useState, useCallback } from 'react'

export default function useStateObject(init = {}){
  const [value, setValue] = useState(init)
  const onChange = useCallback(
    changes => {
      onChange.value = changes === undefined
        ? init
        : {
          ...onChange.value,
          ...changes
        }
      setValue(onChange.value)
    },
    [setValue, init]
  )
  onChange.value = value
  return [value, onChange]
}
