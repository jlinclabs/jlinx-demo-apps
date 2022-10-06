import * as React from 'react'
import Box from '@mui/material/Box'

export default function Form({
  disabled, children, onSubmit, ...props
}){
  const _onSubmit = React.useCallback(
    event => {
      event.preventDefault()
      if (disabled || !onSubmit) return
      const formData = new FormData(event.currentTarget)
      onSubmit(event, formData)
    },
    [disabled, onSubmit]
  )
  return <Box {...{
    component: 'form',
    disabled,
    ...props,
    onSubmit: _onSubmit,
  }}>{children}</Box>
}
