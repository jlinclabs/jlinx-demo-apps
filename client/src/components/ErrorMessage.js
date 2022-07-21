import * as React from 'react'
import Alert from '@mui/material/Alert'

const ErrorMessage = ({error, ...props}) => {
  if (!error) return null
  return <Alert severity="error" {...props}>{error.message}</Alert>
}

export default ErrorMessage
