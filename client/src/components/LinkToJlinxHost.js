import * as React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch'

import { useProfile } from '../resources/profiles'
import Link from '../components/Link'
import ErrorMessage from '../components/ErrorMessage'

export default function LinkToJlinxHost({ host, id, ...props }){
  return <Link {...props} to={`${host}/${id}/stream`} target="_blank">
    <ContentPasteSearchIcon/>
  </Link>

}


