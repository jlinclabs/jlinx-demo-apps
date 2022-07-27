import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { useState, useCallback } from 'react'
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


import { fileToImageDataURL, resizeImage } from '../lib/imageHelpers'
import { useMyProfiles, useCreateProfile } from '../resources/profiles'
import Layout from '../Layout'
import Link from '../components/Link'
import ErrorMessage from '../components/ErrorMessage'
import Timestamp from '../components/Timestamp'
import Profile from '../components/Profile'

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
                  alt={profile.state.name}
                  src={profile.state.avatar}
                />
              </ListItemAvatar>
              <ListItemText {...{
                primaryTypographyProps: {
                  sx: {
                    fontFamily: 'monospace',
                    whiteSpace: 'nowrap',
                  },
                },
                primary: `${profile.state.name}`,
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
  const [ processingAvatar, setPrcessingAvatar ] = useState(false)
  const [ avatarError, setAvatarError ] = useState(false)
  const [ name, setName ] = useState('')
  const [ avatar, setAvatar ] = useState('')

  const createProfile = useCreateProfile({
    onSuccess(profile){
      console.log('CREATED', { profile })
      navigate(`/profiles/${profile.id}`)
    },
    onFailure(error){
      console.error(error)
    },
  })

  const onAvatarUpload = useCallback(
    async event => {
      console.log(event.target)
      const file = event.target.files[0]
      setPrcessingAvatar(true)
      try{
        let uri = await resizeImage({
          dataUri: await fileToImageDataURL(file),
          height: 240,
          width: 240,
          resizeTo: 'fill',
        })
        setAvatar(uri)
      }catch(error){
        setAvatarError(error)
      }finally{
        setPrcessingAvatar(false)
      }
    },
    []
  )

  const disabled = createProfile.pending
  return <Paper {...{
    elevation: 3,
    component: 'form',
    sx: { p: 2, m: 1 },
    onSubmit(event){
      event.preventDefault()
      createProfile({
        profile: {
          name: name || undefined,
          avatar: avatar || undefined,
        },
      })
    }
  }}>
    <Typography component="h1" variant="h3">
      New Profile
    </Typography>
    <Stack spacing={2} direction="row" alignItems="center" mt={2}>
      <Avatar
        alt={name}
        src={avatar}
        sx={{ width: 56, height: 56 }}
      />
      <div>
        <ErrorMessage error={avatarError}/>
        <Button
          disabled={!!processingAvatar}
          variant="contained"
          component="label"
        >
          Upload
          <input
            disabled={!!processingAvatar}
            hidden accept="image/*" multiple type="file"
            onChange={onAvatarUpload}
          />
        </Button>
      </div>
    </Stack>
    <Typography variant="body1" sx={{my: 2}}>
      Which contract do you want to offer?
    </Typography>

    <TextField
      label="Your name"
      disabled={disabled}
      margin="normal"
      fullWidth
      name="Name"
      placeholder="Alice Jones"
      value={name}
      onChange={e => { setName(e.target.value) }}
    />
    {createProfile.error && <ErrorMessage error={createProfile.error} />}
    <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
      <Button type="submit" variant="contained">{`Create`}</Button>
    </Box>
  </Paper>
}


function Show(){
  const { id } = useParams()
  return <Container maxWidth="sm">
    <Paper
      elevation={3}
      sx={{ m: 3, p: 2 }}
    >
      <Profile id={id} />
    </Paper>
  </Container>
}


function Edit(){
  return <Box>
    Edit
  </Box>
}
