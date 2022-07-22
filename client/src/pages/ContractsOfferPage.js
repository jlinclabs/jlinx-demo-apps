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
  const [identifiers = []] = useMyIdentifiers()

  const [ contractUrl, setContractUrl ] = useState('https://contracts.io/sisa-suyF9tPmVrtuuLn3R4XdzGXMZN6aFfCIXuXwGpAHtCw.md')
  const [ identifierDid, setIdentifierDid ] = useState('')
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
    <FormControl fullWidth>
      <InputLabel id="identifierDidLabel">Identifier</InputLabel>
      <Select
        name="identifierDid"
        labelId="identifierDidLabel"
        disabled={disabled}
        autoFocus
        value={identifierDid}
        onChange={e => { setIdentifierDid(e.target.value) }}
      >
        {identifiers.map(identifier =>
          <MenuItem
            key={identifier.did}
            value={identifier.did}
          >{identifier.did}</MenuItem>
        )}
      </Select>
    </FormControl>
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
