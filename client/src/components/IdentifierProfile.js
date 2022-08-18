import * as React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

import { useIdentifier } from '../resources/identifiers'
import Link from './Link'
import LinkToCeramicApi from '../components/LinkToCeramicApi'
import ErrorMessage from './ErrorMessage'
import Profile from './Profile'

export default function IdentifierProfile({ identifierId, sx, ...props }){
  const [identifier, { loading, error }] = useIdentifier(identifierId)
  if (loading) return <CircularProgress />
  if (error) return <ErrorMessage error={error} />
  return <Box>
    <Typography variant="h6">
      <Link
        to={`/identifiers/${identifierId}`}
        underline="none"
      >
        {`identifier ${identifier.id}`}
      </Link>
      <LinkToCeramicApi endpoint={identifier.id}/>
    </Typography>
    {identifier.profileId && <Profile id={identifier.profileId} />}
  </Box>
}
