import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Avatar from '@mui/material/Avatar'

import { useMyProfiles } from '../resources/profiles'
import { useMyIdentifiers } from '../resources/identifiers'
import { useOfferContract } from '../resources/contracts'
import Layout from '../Layout'
import ErrorMessage from '../components/ErrorMessage'

export default function OfferContractPage({ router }) {
  return <Layout title="Offer A Contract" requireLoggedIn>
    <Container maxwidth="lg">
      <OfferContractForm {...{ router }}/>
    </Container>
  </Layout>
}

function OfferContractForm(){
  const navigate = useNavigate()
  const [identifiers] = useMyIdentifiers()
  const [profiles] = useMyProfiles()
  const [contractUrl, setContractUrl] = useState('https://contracts.io/sisa-suyF9tPmVrtuuLn3R4XdzGXMZN6aFfCIXuXwGpAHtCw.md')
  const [identifierDid, setIdentifierDid] = useState('')
  const offerContract = useOfferContract({
    onSuccess(contract){
      navigate(`/contracts/${contract.id}`)
    },
  })

  const disabled = offerContract.pending
  return <Paper {...{
    elevation: 3,
    component: 'form',
    sx: { p: 2, m: 1 },
    onSubmit(event){
      event.preventDefault()
      offerContract({
        contractUrl,
        identifierDid,
      })
    }
  }}>
    <Typography component="h1" variant="h3">
      Offer a Contract
    </Typography>
    <Typography variant="body1" sx={{my: 2}}>
      Which identifier do you want to offer this contract as?
    </Typography>
    <IdentitySelectInput {...{
      autoFocus: true,
      value: identifierDid,
      onChange: e => { setIdentifierDid(e.target.value) },
      identifiers,
      profiles,
    }}/>
    <Typography variant="body1" sx={{my: 2}}>
      Which contract do you want to offer?
    </Typography>

    <TextField
      label="Contract URL"
      disabled={disabled}
      margin="normal"
      required
      fullWidth
      name="contractUrl"
      placeholder="https://contracts.io/sisa-suyF9tPmVrtuuLn3R4XdzGXMZN6aFfCIXuXwGpAHtCw.md"
      value={contractUrl}
      onChange={e => { setContractUrl(e.target.value) }}
    />
    {offerContract.error && <ErrorMessage error={offerContract.error} />}
    <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
      <Button type="submit" variant="contained">{`Create`}</Button>
    </Box>
  </Paper>
}

function IdentitySelectInput({
  identifiers, profiles,
  value, onChange, disabled, loading = false, ...props
}){
  if (!identifiers || !profiles) loading = true
  return <FormControl fullWidth>
    <InputLabel id="IdentitySelectInputLabel">Identifier</InputLabel>
    <Select {...{
      name: 'identity',
      ...props,
      labelId: 'IdentitySelectInputLabel',
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
