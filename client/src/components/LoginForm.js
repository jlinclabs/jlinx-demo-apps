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
  const [secretKey, setSecretKey] = useState('')

  const login = useLogin()

  const onSubmit = event => {
    event.preventDefault()
    login({ secretKey })
  }

  const submitOnEnter = event => {
    if (event.key === 'Enter') {
      event.preventDefault()
      login({ secretKey })
    }
  }
  const disabled = !!login.pending
  return <Paper {...props}>
    <Typography variant="h4">Login</Typography>

    <Box mt={4}>
      <Box sx={{textAlign: 'center'}}>
        <Button disabled type="submit" variant="contained" >WITH YOUR CRYPTO WALLET</Button>
      </Box>
      {/* <Typography variant="body2">*coming soon</Typography> */}
    </Box>

    <Divider sx={{my:3}}>OR</Divider>

    <Box {...{
      component: 'form',
      onSubmit,
      sx: { m: 2, p: 2 }
    }}>
      <ErrorMessage error={login.error}/>
      <TextField
        InputProps={{
          sx: {
            whiteSpace: 'pre-wrap',
            fontSize: 'smaller'
          }
        }}
        multiline
        label="Secret Key"
        autoComplete="new-password"
        disabled={disabled}
        margin="normal"
        required
        pattern=".{128,}"
        fullWidth
        name="secretKey"
        type="text"
        value={secretKey}
        onChange={e => { setSecretKey(e.target.value) }}
        onKeyDown={submitOnEnter}
      />

      <Stack spacing={2} direction="row-reverse" mt={2}>
        <Button type="submit" variant="contained" >Submit</Button>
        <Button variant="text" component={Link} to="/signup">signup</Button>
        {/* <Button variant="text" component={Link} to="/reset-password" color="secondary">reset password</Button> */}
      </Stack>
    </Box>
  </Paper>
}
