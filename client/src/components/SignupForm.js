import { useState } from 'react'

import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import AutorenewIcon from '@mui/icons-material/Autorenew'

import ErrorMessage from './ErrorMessage'
import { useSignup } from '../resources/session'

export default function SignupForm(props){
  const [email, setEmail] = useState('')

  const signup = useSignup()

  const onSubmit = event => {
    event.preventDefault()
    signup({ email })
  }
  const disabled = !!signup.pending
  const emailIsValid = email.length >= 3 && email.includes('@')
  const submittable = emailIsValid
  return <Paper {...props}>
    <Typography variant="h4">Signup</Typography>

    <Box {...{
      component: 'form',
      onSubmit,
    }}>
      <ErrorMessage error={signup.error}/>
      <TextField
        label="email"
        autoComplete="email"
        disabled={disabled}
        margin="normal"
        required
        fullWidth
        name="email"
        type="email"
        value={email}
        onChange={e => { setEmail(e.target.value) }}
      />

      <Stack spacing={2} direction="row" justifyContent="center" mt={2}>
        <Button
          disabled={disabled || !submittable}
          type="submit"
          variant="contained"
        >Signup</Button>
      </Stack>
    </Box>

  </Paper>
}



function randomString(length){
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()'
  const charLength = chars.length

  let ints = new Uint32Array(length)
  crypto.getRandomValues(ints)
  ints = [...ints]

  let result = ''
  while(ints.length > 0){
    result += chars.charAt(ints.shift() % charLength)
  }
  return result
}
