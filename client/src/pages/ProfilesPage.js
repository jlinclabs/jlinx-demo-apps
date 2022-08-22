import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { useCallback } from 'react'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Avatar from '@mui/material/Avatar'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'


import useStateObject from '../lib/useStateObject'
import { useUploadFile } from '../lib/uploads'
import {
  useProfile,
  useMyProfiles,
  useCreateProfile,
  useUpdateProfile,
} from '../resources/profiles'
import { useMyIdentifiers } from '../resources/identifiers'
import Layout from '../Layout'
import Link from '../components/Link'
import ErrorMessage from '../components/ErrorMessage'
import Timestamp from '../components/Timestamp'
import Profile from '../components/Profile'
import InspectObject from '../components/InspectObject'
import LinkToCeramicApi from '../components/LinkToCeramicApi'
import LinkToDid from '../components/LinkToDid'
import CeramicStreamEvents from '../components/CeramicStreamEvents'
import IdentifierSelectInput from '../components/IdentifierSelectInput'

export default function ProfilesPage() {
  return <Layout title="Profiles" requireLoggedIn>
    <Container maxwidth="lg">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/new" element={<New />} />
        <Route path="/:id" element={<Show />} />
        <Route path="/:id/edit" element={<Edit />} />
      </Routes>
    </Container>
  </Layout>
}

function Index(){
  const [myProfiles, {loading, error}] = useMyProfiles()

  return <Box>
    <Typography mt={2} variant="h3">Profiles</Typography>

    <Stack spacing={2} sx={{maxWidth: '400px'}}>
      <Button
        variant="contained"
        component={Link}
        to="/profiles/new"
      >{`New Profile`}</Button>
    </Stack>

    {error && <ErrorMessage error={error}/>}
    <List sx={{
      width: '100%',
      // bgcolor: 'background.paper',
      // flexGrow: 1,
    }}>
      {(loading || !myProfiles) ?
        Array(3).fill().map((_, i) =>
          <Skeleton key={i} animation="wave" height="100px" />
        )
      : myProfiles.length === 0 ?
        <span>You don't have any profiles</span>
      : myProfiles.map(profile =>
          <ListItem {...{
            key: profile.id,
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
              to: `/profiles/${profile.id}`,
              // to: Link.to.myIdentifier({ did: identifier.did })
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
                primary: `${profile.name}`,
                secondary: <span>
                  created <Timestamp at={profile.createdAt}/>
                </span>
              }}/>
            </ListItemButton>
          </ListItem>
        )
      }
    </List>
  </Box>
}


function New(){
  const navigate = useNavigate()

  const [value, onChange] = useStateObject({
    name: '',
    avatar: null,
  })

  const createProfile = useCreateProfile({
    onSuccess(profile){
      console.log('CREATED', { profile })
      navigate(`/profiles/${profile.id}`)
    },
    onFailure(error){
      console.error(error)
    },
  })

  const onSubmit = () => {
    createProfile({
      profile: value,
    })
  }

  return <Paper
    sx={{m:2, p: 2}}
  >
    <Typography component="h1" variant="h3">
      New Profile
    </Typography>
    <ProfileForm {...{
      value,
      onChange,
      submitText: (
        createProfile.pending ? 'Create' : 'Creating'
      ),
      onSubmit,
      disabled: createProfile.pending,
      error: createProfile.error,
    }}/>
  </Paper>
}


function Show(){
  const { id } = useParams()
  const [profile, { loading, error }] = useProfile(id)
  const editable = profile && !profile.isReadOnly
  return <Container maxWidth="md">
    <Paper
      elevation={3}
      sx={{ m: 3, p: 2 }}
    >
      {loading
        ? <CircularProgress/>
        : <>
          <Typography variant="h4" mb={2}>Profile</Typography>
          <Stack
            spacing={2}
            direction="row"
            alignItems="center"
          >
            <Link to={`/profiles/${id}`}>
              <Avatar
                alt={profile.name}
                src={profile.avatar}
                sx={{ width: 56, height: 56 }}
              />
            </Link>
            <Link to={`/profiles/${id}`}>
              <Typography variant="h4">{profile.name}</Typography>
            </Link>
            <LinkToCeramicApi endpoint={profile.id}/>
          </Stack>

          <Box my={3}>
            <LinkToDid did={profile.did}/>
          </Box>

          {editable
            ? <Stack
              spacing={2}
              direction="row-reverse"
            >
              <Button
                variant="contained"
                component={Link}
                to={`/profiles/${id}/edit`}
              >{`Edit Profile`}</Button>
            </Stack>
            : null
          }
        </>
      }
    </Paper>

    <Paper
      elevation={3}
      sx={{ m: 3, p: 2 }}
    >
      <Typography variant="h6" mb={2}>Ceramic Stream Events</Typography>
      <CeramicStreamEvents id={id}/>
    </Paper>
  </Container>
}


function Edit(){
  const { id: profileId } = useParams()

  const navigate = useNavigate()

  const [value, onChange] = useStateObject()

  const [profile, { loading, error }] = useProfile(profileId)

  const updateProfile = useUpdateProfile({
    onSuccess(profile){
      console.log('CREATED', { profile })
      navigate(`/profiles/${profile.id}`)
    },
    onFailure(error){
      console.error(error)
    },
  })

  const onSubmit = () => {
    updateProfile({
      profileId,
      did: profile.did,
      changes: value,
    })
  }

  console.log({ profile, value })
  return <Paper
    sx={{m:2, p: 2}}
  >
    <Typography component="h1" variant="h3">
      Edit Profile
    </Typography>
    <Typography component="h2" variant="h6" mb={2}>
      ID: {profileId}
    </Typography>
    {loading
      ? <CircularProgress/>
      : <ProfileForm {...{
        value: {
          ...profile,
          ...value,
        },
        onChange,
        submitText: (
          updateProfile.pending ? 'Saving…' : 'Save'
        ),
        onSubmit,
        disabled: updateProfile.pending,
        error: error || updateProfile.error,
      }}/>
    }
  </Paper>
}


function ProfileForm(props){
  const [myIdentifiers = [], myIdentifiersReq] = useMyIdentifiers()

  const uploadAvatar = useUploadFile({
    onSuccess(url){
      props.onChange({ avatar: url })
    },
  })

  const onAvatarFileSelect = useCallback(
    event => {
      const file = event.target.files[0]
      event.target.value = null
      uploadAvatar.call(file)
    },
    [uploadAvatar]
  )

  const editing = !!props.value.id
  const disabled = props.disabled || uploadAvatar.pending
  return <Box {...{
    disabled,
    component: 'form',
    onSubmit(event){
      event.preventDefault()
      props.onSubmit()
    }
  }}>

    {editing
      ? <></>
      : <Typography variant="body1" sx={{my: 2}}>
        Which identifier do you want to associate this profile with?
      </Typography>
    }

    <IdentifierSelectInput
      value={props.value.did}
      onChange={e => { props.onChange({ did: e.target.value }) }}
    />
    {/* <FormControl fullWidth>
      <ErrorMessage error={myIdentifiersReq.error}/>
      <InputLabel id="profileIdentifierLabel">Identifier</InputLabel>
      <Select
        name="did"
        labelId="profileIdentifierLabel"
        disabled={disabled || myIdentifiersReq.loading || editing}
        autoFocus
        value={props.value.did}
        onChange={e => { props.onChange({ did: e.target.value }) }}
      >
        {myIdentifiers.map(identifier =>
          <MenuItem
            key={identifier.id}
            value={identifier.id}
          >
            <Stack spacing={2} direction="row" alignItems="center">
              <Typography component="span" variant="body1">{identifier.id}</Typography>
            </Stack>
          </MenuItem>
        )}
      </Select>
    </FormControl> */}
    <Stack spacing={2} direction="row" alignItems="center" mt={2}>
      <Box sx={{ width: 56, height: 56 }}>
        {uploadAvatar.pending
          ? <CircularProgress
            sx={{ m: 1, width: 56, height: 56 }}
          />
          : <Avatar
            alt={props.value.name}
            src={props.value.avatar}
            sx={{ width: 56, height: 56 }}
          />
        }
      </Box>
      <div>
        <ErrorMessage error={uploadAvatar.error}/>
        <Button
          disabled={disabled}
          variant="contained"
          component="label"
        >
          {
            uploadAvatar.error ? 'failed' :
            uploadAvatar.pending ? 'Uploading…' :
            'Upload'
          }
          <input
            disabled={disabled}
            hidden accept="image/*" multiple type="file"
            onChange={onAvatarFileSelect}
          />
        </Button>
      </div>
    </Stack>

    <TextField
      label="Your name"
      disabled={props.disabled}
      margin="normal"
      fullWidth
      name="Name"
      placeholder="Alice Jones"
      value={props.value.name}
      onChange={e => { props.onChange({name: e.target.value}) }}
    />
    {props.error && <ErrorMessage error={props.error} />}
    <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
      <Button
        type="submit"
        variant="contained"
        disabled={disabled}
      >{props.submitText}</Button>
    </Box>
  </Box>
}
