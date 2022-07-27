import * as React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'

import { useProfile } from '../resources/profiles'
import ErrorMessage from '../components/ErrorMessage'

export default function Profile({ id, ...props }){
  const [profile, { loading, error }] = useProfile(id)
  if (!profile) return <CircularProgress/>
  if (error) return <ErrorMessage {...{ error }}/>
  return <Box {...props}>
    <Stack
      spacing={2}
      direction="row"
      alignItems="center"
    >
      <Avatar
        alt={profile.state.name}
        src={profile.state.avatar}
        sx={{ width: 56, height: 56 }}
      />
      <Typography variant="h4">{profile.state.name}</Typography>
    </Stack>
  </Box>
}


