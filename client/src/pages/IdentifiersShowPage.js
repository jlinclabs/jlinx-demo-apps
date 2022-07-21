import { useParams } from 'react-router-dom'

import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress';

import { useIdentifier } from '../resources/identifiers'
import Layout from '../Layout'
import ErrorMessage from '../components/ErrorMessage'
import Timestamp from '../components/Timestamp'

export default function IdenitifiersShowPage() {
  const { did } = useParams()
  // TODO redirect on invalid did
  return <Layout title="Identifier" requireLoggedIn>
    <Container maxwidth="md">
      <Identifier {...{ did }}/>
    </Container>
  </Layout>
}

function Identifier({ did }){
  const [identifier, { loading, error }] = useIdentifier(did)
  if (!identifier) return <CircularProgress/>
  if (error) return <ErrorMessage {...{ error }}/>
  return <Paper
    sx={{
      m: 4,
      p: 2,
    }}
    component="div"
  >
    <Typography variant="h4">Identifier</Typography>
    <Typography variant="h5">{did}</Typography>
    <Typography variant="body2">Created at: <Timestamp at={identifier.createdAt}/></Typography>
    <Typography variant="body2" sx={{overflow: 'auto'}} component="pre">
      <code>{JSON.stringify(identifier.didDocument, null, 2)}</code>
    </Typography>
  </Paper>
}



