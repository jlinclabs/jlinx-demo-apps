import * as React from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import { useMyProfiles } from '../resources/profiles'
import { useMyIdentifiers } from '../resources/identifiers'
import ErrorMessage from './ErrorMessage'

export default function IdentifierSelectInput({
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
            <Typography component="span" variant="body2">{identifier.id}</Typography>
          </Stack>
        </MenuItem>
      })}
    </Select>
  </FormControl>
}
