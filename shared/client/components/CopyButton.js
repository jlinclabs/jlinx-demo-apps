import * as React from 'react'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import CopyAllIcon from '@mui/icons-material/CopyAll'
import { copyText } from '../lib/clipboard.js'

export default function CopyButton({
  children,
  variant = 'button',
  value,
  ...props
}){
  const copy = React.useCallback(() => { copyText(value) }, [value])
  if (variant === 'icon'){
    return <IconButton
      color="primary"
      aria-label="upload picture"
      component="label"
      onClick={copy}
    >
      {children}
      <CopyAllIcon />
    </IconButton>
  }
  return <Button {...{
    onClick: copy,
  }}>
    {children}
  </Button>
  // return <Button

}

