import * as React from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Avatar from '@mui/material/Avatar'

import { useMyProfiles } from '../resources/profiles'
import { useMyIdentifiers } from '../resources/identifiers'
import Link from './Link'
import ErrorMessage from './ErrorMessage'
import Profile from './Profile'

export default function IdentifierProfile({
  value, onChange, disabled = false, ...props
}){
  const [identifiers, identifiersReq] = useMyIdentifiers()
  const [profiles, profilesReq] = useMyProfiles()

  const loading = identifiersReq.loading || profilesReq.loading
  const error = identifiersReq.error || profilesReq.error

  return <FormControl fullWidth>
    <InputLabel id="IdentifierSelectInputLabel">Identifier</InputLabel>
    <ErrorMessage error={error}/>
    <Select {...{
      name: 'identity',
      ...props,
      labelId: 'IdentifierSelectInputLabel',
      disabled: !!(disabled || loading),
      value,
      onChange,
    }}>
      {loading ? null : identifiers.map(identifier => {
        const profile = profiles
          .find(profile => profile.id === identifier.profileId)
          || { }
        console.log({ identifier, profile })
        return <MenuItem key={identifier.id} value={identifier.id}>
          <Stack spacing={2} direction="row" alignItems="center">
            <Avatar
              alt={profile.name}
              src={profile.avatar}
              sx={{ width: 56, height: 56 }}
            />
            <Stack spacing={0} direction="column">
              <Typography component="span" variant="body1">{profile.name}</Typography>
              <Typography component="span" variant="body2">{identifier.id}</Typography>
            </Stack>
          </Stack>
        </MenuItem>
      })}
    </Select>
  </FormControl>
}
