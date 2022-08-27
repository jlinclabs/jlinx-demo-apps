import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { useState, useCallback } from 'react'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Avatar from '@mui/material/Avatar'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'

import { useMyProfiles } from '../resources/profiles'
import {
  useMyIdentifiers,
  useCreateIdentifier,
  useIdentifier,
} from '../resources/identifiers'

import Layout from '../Layout'
import Link from '../components/Link'
import ErrorMessage from '../components/ErrorMessage'
import Timestamp from '../components/Timestamp'
import LinkToCeramicApi from '../components/LinkToCeramicApi'
import Profile from '../components/Profile'

import InspectObject from '../components/InspectObject'

export default function IdenitifiersPage() {
  return <Layout title="Identifiers" requireLoggedIn>
    <Container p={4}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/new" element={<New />} />
        <Route path="/:id" element={<Show />} />
        <Route path="/:id/did-document" element={<ShowDidDocument />} />
        <Route path="/:id/edit" element={<Edit />} />
      </Routes>
    </Container>
  </Layout>
}


function Index(){
  return <Box>
    <Typography mt={2} variant="h3">My Identifiers</Typography>
    <Stack spacing={2} sx={{maxWidth: '400px'}}>
      <Button
      variant="contained"
        component={Link}
        to="/identifiers/new"
      >{`New Identifier`}</Button>
    </Stack>
    <MyIdentifiersList />
  </Box>
}

function New() {
  const navigate = useNavigate()
  // const [ profileId, setProfileId ] = useState('')
  // const [myProfiles = [], {loading: loadingMyProfiles, error: errorLoadingMyProfiles}] = useMyProfiles()

  const createIdentifier = useCreateIdentifier({
    onSuccess(did){
      console.log('CREATED', { did })
      navigate(`/identifiers/${did}`)
    },
    onFailure(error){
      console.error(error)
    },
  })

  const disabled = createIdentifier.pending
  return <Paper {...{
    elevation: 3,
    component: 'form',
    sx: { p: 2, m: 1 },
    onSubmit(event){
      event.preventDefault()
      createIdentifier({
        // profileId,
      })
    }
  }}>
    <Typography component="h1" variant="h3">
      New Identifier
    </Typography>

    {/*
    <Typography variant="body1" sx={{my: 2}}>
      Which profile fo you want to associate with this identifier?
    </Typography>

    <FormControl fullWidth>
      <ErrorMessage error={errorLoadingMyProfiles}/>
      <InputLabel id="identifierProfileLabel">Profile</InputLabel>
      <Select
        name="profileId"
        labelId="identifierProfileLabel"
        disabled={disabled || loadingMyProfiles}
        autoFocus
        value={profileId}
        onChange={e => { setProfileId(e.target.value) }}
      >
        <MenuItem key="none" value="">
          <Typography component="span" variant="body2">
            <Stack spacing={2} direction="row" alignItems="center">
              <Avatar sx={{ width: 56, height: 56 }} />
              <Typography component="span" variant="body1">{'none'}</Typography>
            </Stack>
          </Typography>
        </MenuItem>
        {myProfiles.map(profile =>
          <MenuItem
            key={profile.id}
            value={profile.id}
          >
            <Stack spacing={2} direction="row" alignItems="center">
              <Avatar
                alt={profile.name}
                src={profile.avatar}
                sx={{ width: 56, height: 56 }}
              />
              <Typography component="span" variant="body1">{profile.name}</Typography>
            </Stack>
          </MenuItem>
        )}
      </Select>
    </FormControl> */}

    {createIdentifier.error && <ErrorMessage error={createIdentifier.error} />}
    <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
      <Button type="submit" variant="contained">{`Create`}</Button>
    </Box>
  </Paper>
}

function Show() {
  const { id } = useParams()
  return <Container maxWidth="md">
    <Paper
      elevation={3}
      sx={{ m: 3, p: 2 }}
    >
      <Identifier id={id} />
    </Paper>
  </Container>
}

function ShowDidDocument() {
  const { id } = useParams()
  return <Container>
    <Paper
      elevation={3}
      sx={{ m: 3, p: 2 }}
    >
      <IdentifierDidDocument id={id} />
    </Paper>
  </Container>
}

function Edit() {
  return <Container>
    Edit
  </Container>
}


function Identifier({ id, ...props }){
  const [identifier, { loading, error }] = useIdentifier(id)
  if (!identifier) return <CircularProgress/>
  if (error) return <ErrorMessage {...{ error }}/>
  const did = identifier.id
  const editable = identifier.ours

  return <Box {...props}>
    <Stack flexDirection="row" justifyContent="space-between">
      <Typography
        variant="h5"
        sx={{
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipses',
        }}
      >
        {`Identifier`}
      </Typography>
      <LinkToCeramicApi endpoint={identifier.id} />
    </Stack>
    <Box>
      <Typography variant="h7">
        <Link to={`/identifiers/${id}`}>{`DID: ${did}`}</Link>
      </Typography>
    </Box>

    {/* <Box my={2}>
      <Typography variant="h7">
        {'Created: '}
        <Timestamp at={identifier.createdAt}/>
      </Typography>
    </Box> */}

    {/* <Box mt={2}>
      <Typography variant="h6">Profile:</Typography>
      {identifier.profileId
        ? <Profile id={identifier.profileId} />
        : null
      }
    </Box> */}

    {/* {editable
      ? <Stack
        spacing={2}
        direction="row-reverse"
      >
        <Button
          variant="contained"
          component={Link}
          to={`/identifiers/${id}/edit`}
        >{`Edit Identifier`}</Button>
      </Stack>
      : null
    } */}

    <Box>
      <Typography variant="h7">DID Document</Typography>
      <InspectObject object={identifier.didDocument}/>
    </Box>


  </Box>
}

function IdentifierDidDocument({ id, ...props }){
  const [identifier, { loading, error }] = useIdentifier(id)
  if (!identifier) return <CircularProgress/>
  if (error) return <ErrorMessage {...{ error }}/>
  return <Box {...props}>
    <Typography variant="h4">DID Document</Typography>
    <InspectObject object={identifier.didDocument}/>
    {/* <InspectObject object={identifier.didDocument}/> */}
  </Box>
}

function MyIdentifiersList(){
  const [myIdentifiers, myIdentifiersRequest] = useMyIdentifiers()
  const [myProfiles, myProfilesRequest] = useMyProfiles()

  const loading = myIdentifiersRequest.loading || myProfilesRequest.loading
  const error = myIdentifiersRequest.error || myProfilesRequest.error

  if (error){
    return <ErrorMessage {...{error}}/>
  }

  if (loading) {
    return Array(3).fill().map((_, i) =>
      <Skeleton key={i} animation="wave" height="100px" />
    )
  }

  if (myIdentifiers.length === 0){
    return <span>you dont have any identities</span>
  }
  return <List sx={{
    width: '100%',
  }}>
    {myIdentifiers.map(identifier =>
      <MyIdentifier {...{
        key: identifier.id,
        identifier,
        profile: myProfiles.find(p => p.id === identifier.profileId)
      }}/>
    )}
  </List>
}

function MyIdentifier({ identifier, profile = {} }){
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
      to: `/identifiers/${identifier.id}`,
    }}>
      <ListItemAvatar>
        <Avatar
          alt={profile.name}
          src={profile.avatar}
        />
      </ListItemAvatar>
      <ListItemText {...{
        primaryTypographyProps: {
          sx: {
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
          },
        },
        primary: `${identifier.id}`,
        // secondary: <span>
        //   created <Timestamp at={identifier.createdAt}/>
        // </span>
      }}/>
    </ListItemButton>
  </ListItem>
}
