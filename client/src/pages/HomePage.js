import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'

import { useCurrentUser } from '../resources/session'
import Layout from '../Layout'
import Link from '../components/Link'
import LoginForm from '../components/LoginForm'
import SignupForm from '../components/SignupForm'

export default function HomePage() {
  const { currentUser } = useCurrentUser()
  return <Layout>
    <Container maxWidth="md">
      {currentUser
        ? <></>
        : <Stack>
          <SignupForm elevation={3} sx={{m: 2, p: 2}}/>
          <LoginForm elevation={3} sx={{m: 2, p: 2}}/>
        </Stack>
      }

    </Container>
  </Layout>
}
