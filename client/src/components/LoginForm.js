import { useState } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'

import Link from './Link'
import ErrorMessage from './ErrorMessage'
import { useLogin } from '../resources/session'

export default function LoginForm(props){
  const [email, setEmail] = useState('')

  const login = useLogin()

  const onSubmit = event => {
    event.preventDefault()
    login({ email })
  }

  const submitOnEnter = event => {
    if (event.key === 'Enter') {
      event.preventDefault()
      login({ email })
    }
  }
  const disabled = !!login.pending
  return <Paper {...props}>
    <Typography variant="h4">Login</Typography>
    <Box {...{
      component: 'form',
      onSubmit,
    }}>
      <ErrorMessage error={login.error}/>
      <TextField
        label="Email"
        autoComplete="email"
        disabled={disabled}
        margin="normal"
        required
        fullWidth
        name="email"
        type="email"
        value={email}
        onChange={e => { setEmail(e.target.value) }}
        onKeyDown={submitOnEnter}
      />

      <Stack spacing={2} direction="row" justifyContent="center" mt={2}>
        <Button type="submit" variant="contained" >Login</Button>
      </Stack>
    </Box>
  </Paper>
}
