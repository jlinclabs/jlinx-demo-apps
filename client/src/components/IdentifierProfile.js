import * as React from 'react'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'

export default function IdentifierProfile({ identifier, sx, ...props }){
  if (!identifier) identifier = '??????????????????????'
  return <ListItemButton
    dense
    sx={{
      // p: 0,
      ...sx,
    }}
    {...props}
  >
    <ListItemAvatar>
      <Avatar>{identifier.slice(12)[0]}</Avatar>
    </ListItemAvatar>
    <ListItemText
      primary={`${identifier}`}
      secondary={`IDENTIFIER PROFILE PLACEHOLDER`}
    />
  </ListItemButton>
}
