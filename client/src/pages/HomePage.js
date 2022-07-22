import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'

import { useCurrentUser } from '../resources/session'
import Layout from '../Layout'
import Link from '../components/Link'

export default function HomePage() {
  const { currentUser } = useCurrentUser()
  return <Layout>
    <Container maxWidth="md">
      <Paper elevation={3} sx={{m: 2, p: 2}}>
        <Typography variant="h3">
          {currentUser
            ? `Welcome back ${currentUser.email}`
            : `Welcome to ${process.env.APP_NAME}`
          }
        </Typography>
        {currentUser ? null : <>
          <Stack spacing={2} mt={3}>
            <Button variant="contained" component={Link} href="/login">Login</Button>
            <Button variant="contained" component={Link} href="/signup">Signup</Button>
          </Stack>
        </>}
      </Paper>
    </Container>
  </Layout>
}


