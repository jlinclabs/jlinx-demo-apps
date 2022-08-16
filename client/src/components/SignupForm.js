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
  const [agreed, setAgreed] = useState(false)
  const [secretKey, setSecretKey] = useState('')

  const signup = useSignup()

  const copySecretKey = () => {
    navigator.clipboard.writeText(secretKey)
  }

  const generateSecretKey = () => {
    setSecretKey(randomString(128))
  }

  const onSubmit = event => {
    event.preventDefault()
    signup({ secretKey })
  }
  const disabled = !!signup.pending
  const secretKeyIsValid = secretKey.length >= 128
  const submittable = secretKeyIsValid && agreed
  return <Paper {...props}>
    <Typography variant="h4">Signup</Typography>

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
    }}>
      <ErrorMessage error={signup.error}/>
      <Stack spacing={2} direction="row" alignItems="center" mt={2}>
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
        />
      </Stack>
      <Stack spacing={2} direction="row" justifyContent="center" mt={1} mb={2}>
        <Button
          disabled={!secretKeyIsValid}
          variant="contained"
          onClick={copySecretKey}
        >COPY</Button>
        <Button variant="contained" onClick={generateSecretKey}>
          <AutorenewIcon/>
          REGENERATE
        </Button>
      </Stack>
      <Typography variant="body2">
        To make it easier to signup for this demo we allow you to use a massic secret key.
        <br/>
        <b>You need this to login</b>
        <br/>
        We <b>HIGHLY</b> recommend you generate this and store it in a password manager.
      </Typography>

      <Box mt={3}>
        <FormControlLabel
          control={<Checkbox
            disabled={!secretKeyIsValid}
            value={secretKeyIsValid && agreed}
            onChange={e => { setAgreed(!!e.target.checked) }}
          />}
          label="I have coppied and stored my SecretKey"
        />
      </Box>

      <Stack spacing={2} direction="row" justifyContent="center" mt={2}>
        <Button
          disabled={disabled || !submittable}
          type="submit"
          variant="contained"
        >Create Account</Button>
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
