import * as React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'

import { useProfile } from '../resources/profiles'
import Link from '../components/Link'
import LinkToCeramicApi from '../components/LinkToCeramicApi'
import ErrorMessage from '../components/ErrorMessage'

export default function Profile({ id, ...props }){
  const [profile, { loading, error }] = useProfile(id)
  if (loading) return <CircularProgress/>
  if (error) return <ErrorMessage {...{ error }}/>
  return <Box {...props}>
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
      {/* <LinkToCeramicApi
        host={profile.meta.header.host}
        id={profile.id}
      /> */}
    </Stack>
  </Box>
}


