import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import { useContract, useSignContract } from '../resources/contracts'
import { useMyIdentifiers } from '../resources/identifiers'
import Layout from '../Layout'
import Link from '../components/Link'
import IdentifierProfile from '../components/IdentifierProfile'
import IdentifierSelectInput from '../components/IdentifierSelectInput'

export default function ContractsSignPage() {
  const [search, setSearch] = useSearchParams()
  const setId = id => { setSearch({ id }) }
  const contractId = search.get('id')

  const navigate = useNavigate()
  return <Layout title="Sign A Contract" requireLoggedIn>
    <Container maxwidth="lg">
      {contractId
        ? <SignContractOfferingForm {...{ contractId }}/>
        : <LookupContractOfferingForm {...{ setId }}/>
      }
    </Container>
  </Layout>
}

function LookupContractOfferingForm({ setId }){
  const [ contractId, setContractId ] = useState('')
  return <Paper {...{
    elevation: 3,
    component: 'form',
    sx: { p: 2, mt: 2 },
    onSubmit(event){
      event.preventDefault()
      // navigate(`/contracts/sign?id=${encodeURIComponent(contractId)}`)
      setId(contractId)
    }
  }}>
    <Typography component="h1" variant="h3">
      Sign a Contract
    </Typography>
    <TextField
      label="Contract Id"
      margin="normal"
      required
      fullWidth
      name="contractUrl"
      placeholder="lGavv2LbRjEPqiLUX1af_DvOz5Qy03PbuWw1I1kcFGs"
      value={contractId}
      onChange={e => { setContractId(e.target.value) }}
    />
    <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
      <Button type="submit" variant="contained">{`Lookup Contract Offering`}</Button>
    </Box>
  </Paper>
}


function SignContractOfferingForm({ contractId }){
  const [identifiers = []] = useMyIdentifiers()
  const [identifierDid, setIdentifierDid] = useState('')
  const [signatureId, setSignatureId] = useState('')
  const [contract, { loading }] = useContract(contractId)
  const signContract = useSignContract({
    onSuccess({ signatureId }){
      console.log({ signatureId })
      setSignatureId(signatureId)
    }
  })
  if (loading) return <span>Loading…</span>
  const disabled = signContract.pending

  return <Paper {...{
    elevation: 3,
    component: 'form',
    sx: { p: 2, mt: 2 },
    onSubmit(event){
      event.preventDefault()
      signContract({
        contractId,
        identifierDid,
      })
    }
  }}>
    <Typography component="h1" variant="h3" mb={3}>
      Sign Contract Offering
    </Typography>

    <Typography paragraph>
      {`The contract`}<br/>
      <Link to={contract.contractUrl}>{contract.contractUrl}</Link><br/>
      {`is being offered to you by:`}<br/>
    </Typography>
    <Paper elevation={2} sx={{p: 2, m: 2}}>
      <IdentifierProfile identifierId={contract.offerer}/>
    </Paper>

    <Typography paragraph>
      <Link
        to={`${contract.jlinxHost}/${contract.id}/stream`}
        target="_blank"
      >PUBLIC RECORD</Link>
    </Typography>

    {signatureId
      ? <>
        <Typography variant="h4" sx={{mt: 2}}>Signed</Typography>
        <Typography paragraph>
          <Link
            to={`${contract.jlinxHost}/${signatureId}/stream`}
            target="_blank"
          >PUBLIC RECORD</Link>
        </Typography>
      </>
      : <>
        <Typography variant="body1" sx={{my: 2}}>
          Which identifier do you want to sign this contract as?
        </Typography>
        <IdentifierSelectInput {...{
          autoFocus: true,
          value: identifierDid,
          onChange: e => { setIdentifierDid(e.target.value) },
        }}/>
        <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
          <Button type="submit" variant="contained">{`Sign Contract`}</Button>
        </Box>
      </>
    }
  </Paper>
}
