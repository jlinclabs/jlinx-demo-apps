import * as React from 'react'
import Stack from '@mui/material/Stack'

export default function ButtonRow({ children, ...props }){
  return <Stack
    spacing={2}
    direction="row-reverse"
    alignItems="center"
    {...props}
  >{children}</Stack>
}
