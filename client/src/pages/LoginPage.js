import { useState } from 'react'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

import Layout from '../Layout'
import Link from '../components/Link'
import ErrorMessage from '../components/ErrorMessage'
import { useCurrentUser, useLogin } from '../resources/session'

export default function LoginPage(props) {
  useCurrentUser({
    redirectToIfFound: '/',
  })
  return <Layout>
    {/* <Head>
      <title>Signup</title>
      <meta name="description" content="Signup" />
      <link rel="icon" href="/favicon.ico" />
    </Head> */}
    <Container maxWidth="sm" sx={{p: 2}}>
      <LoginForm />
    </Container>
  </Layout>
}

function LoginForm({ reloadCurrentUser }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const login = useLogin()

  const onSubmit = event => {
    event.preventDefault()
    login({ email, password })
  }
  const disabled = !!login.pending
  return <Paper {...{
    component: 'form',
    onSubmit,
    sx: { m: 2, p: 2 }
  }}>
    <Typography variant="h4">Login</Typography>
    <ErrorMessage error={login.error}/>
    <TextField
      autoFocus
      label="Email"
      autoComplete="username"
      disabled={disabled}
      margin="normal"
      required
      fullWidth
      name="email"
      type="email"
      placeholder="alice@example.com"
      value={email}
      onChange={e => { setEmail(e.target.value) }}
    />
    <TextField
      label="Password"
      autoComplete="new-password"
      disabled={disabled}
      margin="normal"
      required
      fullWidth
      name="password"
      type="password"
      value={password}
      onChange={e => { setPassword(e.target.value) }}
    />
    <Stack spacing={2} direction="row-reverse" mt={2}>
      <Button type="submit" variant="contained" >Submit</Button>
      <Button variant="text" component={Link} to="/signup">signup</Button>
      <Button variant="text" component={Link} to="/reset-password" color="secondary">reset password</Button>
    </Stack>
  </Paper>
}
