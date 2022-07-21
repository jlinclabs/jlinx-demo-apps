import { useEffect } from 'react'
import Container from '@mui/material/Container'
import Layout from '../Layout'
import ErrorMessage from '../components/ErrorMessage'
import { useCurrentUser, useLogout } from '../resources/session'

export default function LogoutPage() {
  const { currentUser } = useCurrentUser({ redirectToIfNotFound: '/' })
  const logout = useLogout()
  useEffect(() => { logout() }, [])
  return <Layout>
    <Container maxWidth="sm" sx={{p: 2}}>
      <span>Logging out…</span>
      <ErrorMessage error={logout.error}/>
    </Container>
  </Layout>
}
