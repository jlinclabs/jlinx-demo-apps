import { useNavigate } from 'react-router-dom'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Skeleton from '@mui/material/Skeleton'

import { useMyIdentifiers, useCreateIdentifier } from '../resources/identifiers'
import Layout from '../Layout'
import Link from '../components/Link'
import ErrorMessage from '../components/ErrorMessage'
import Timestamp from '../components/Timestamp'

export default function IdenitifiersPage() {
  const navigate = useNavigate()
  const createIdentifier = useCreateIdentifier({
    onSuccess(idenitifier){
      console.log('CREATED', { idenitifier })
      navigate(`/identifiers/${idenitifier.did}`)
    },
    onFailure(error){
      console.error(error)
    },
  })

  return <Layout title="Identifiers" requireLoggedIn>
    <Container maxwidth="lg">
      <Typography mt={2} variant="h3">Identifiers</Typography>

      <Stack spacing={2} sx={{maxWidth: '400px'}}>
        <Button
          variant="contained"
          onClick={() => { createIdentifier() }}
        >{`Create New Identifier`}</Button>
        {createIdentifier.error && <ErrorMessage error={createIdentifier.error}/>}
      </Stack>

      <MyIdentifiersList />
    </Container>
  </Layout>
}


function MyIdentifiersList(){
  const [myIdentifiers,  {loading, error }] = useMyIdentifiers()

  return <List sx={{
    width: '100%',
    // bgcolor: 'background.paper',
    // flexGrow: 1,
  }}>
    <ErrorMessage {...{error}}/>
    {(loading || !myIdentifiers)
      ? Array(3).fill().map((_, i) =>
        <Skeleton key={i} animation="wave" height="100px" />
      )
      : myIdentifiers.map(identifier =>
        <MyIdentifier key={identifier.did} identifier={identifier}/>
      )
    }
  </List>
}

function MyIdentifier({ identifier }){
  return <ListItem {...{
    secondaryAction: (
      undefined
      // <IconButton edge="end" aria-label="delete" {...{onClick}}>
      //   <DeleteIcon />
      // </IconButton>
    ),
  }}>
    <ListItemButton {...{
      role: undefined,
      dense: true,
      component: Link,
      to: `/identifiers/${identifier.did}`,
      // to: Link.to.myIdentifier({ did: identifier.did })
    }}>
      <ListItemText {...{
        primaryTypographyProps: {
          sx: {
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
          },
        },
        primary: `${identifier.did}`,
        secondary: <span>
          created <Timestamp at={identifier.createdAt}/>
        </span>
      }}/>
    </ListItemButton>
  </ListItem>
}
