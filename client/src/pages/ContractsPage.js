import { Routes, Route, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useState, useCallback } from 'react'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Skeleton from '@mui/material/Skeleton'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'

import {
  useContract,
  useMyContracts,
  useOfferContract,
  useSignContract,
  useAckContractSignature
} from '../resources/contracts'

import { useMyIdentifiers } from '../resources/identifiers'
import Layout from '../Layout'
import Link from '../components/Link'
import LinkToCeramicApi from '../components/LinkToCeramicApi'
import Timestamp from '../components/Timestamp'
import ErrorMessage from '../components/ErrorMessage'
import IdentifierProfile from '../components/IdentifierProfile'
import IdentifierSelectInput from '../components/IdentifierSelectInput'
import InspectObject from '../components/InspectObject'

export default function Contracts() {
  return <Layout title="Contracts" requireLoggedIn>
    <Container maxwidth="lg">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/offer" element={<Offer />} />
        <Route path="/sign" element={<Sign />} />
        <Route path="/:id" element={<Show />} />
      </Routes>
    </Container>
  </Layout>
}

function Index(props) {
  return <Container maxwidth="lg">
    <Typography my={2} variant="h3">Contracts</Typography>

    <Stack spacing={2} sx={{maxWidth: '400px'}}>
      <Button
        variant="contained"
        component={Link}
        to="/contracts/offer"
      >{`Offer Contract`}</Button>
      <Button
        variant="contained"
        component={Link}
        to="/contracts/sign"
        sx={{ml: 1}}
      >{`Sign Offered Contract`}</Button>
    </Stack>

    <MyContractsList />
  </Container>
}

function Show() {
  const { id } = useParams()
  const [contract, { loading, error, reload: reloadContract }] = useContract(id)
  if (error) return <ErrorMessage {...{ error }}/>
  return <Container maxwidth="md">
    {
      error ? <ErrorMessage {...{ error }}/> :
      contract ? <Contract {...{ contract }}/> :
      <CircularProgress/>
    }
  </Container>
}

function Offer({ router }) {
  return <Container maxwidth="lg">
    <OfferContractForm {...{ router }}/>
  </Container>
}

function OfferContractForm(){
  const navigate = useNavigate()
  const [contractUrl, setContractUrl] = useState('https://contracts.io/sisa-suyF9tPmVrtuuLn3R4XdzGXMZN6aFfCIXuXwGpAHtCw.md')
  const [identifierId, setIdentifierId] = useState('')
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
        identifierId,
      })
    }
  }}>
    <Typography component="h1" variant="h3">
      Offer a Contract
    </Typography>
    <Typography variant="body1" sx={{my: 2}}>
      Which identifier do you want to offer this contract as?
    </Typography>
    <IdentifierSelectInput {...{
      autoFocus: true,
      value: identifierId,
      onChange: e => { setIdentifierId(e.target.value) },
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

function Sign() {
  const [search, setSearch] = useSearchParams()
  const setId = id => { setSearch({ id }) }
  const contractId = search.get('id')

  const navigate = useNavigate()
  return <Container maxwidth="lg">
    {contractId
      ? <SignContractOfferingForm {...{ contractId }}/>
      : <LookupContractOfferingForm {...{ setId }}/>
    }
  </Container>
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
  const [identifierId, setIdentifierId] = useState('')
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
        identifierId,
      })
    }
  }}>
    <Typography component="h1" variant="h3" mb={3}>
      Sign Contract Offering
    </Typography>

    <Box>
      <LinkToCeramicApi endpoint={contract.id}/>
    </Box>

    <Typography paragraph>
      {`The contract`}<br/>
      <Link to={contract.contractUrl}>{contract.contractUrl}</Link><br/>
      {`is being offered to you by:`}<br/>
    </Typography>

    <Paper elevation={2} sx={{p: 2, m: 2}}>
      <IdentifierProfile identifierId={contract.offerer}/>
    </Paper>

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
          value: identifierId,
          onChange: e => { setIdentifierId(e.target.value) },
        }}/>
        <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
          <Button type="submit" variant="contained">{`Sign Contract`}</Button>
        </Box>
      </>
    }
  </Paper>
}


function Contract({ contract }){

  return <Paper
    sx={{
      m: 4,
      p: 2,
    }}
    component="div"
  >
    <Stack flexDirection="row" justifyContent="space-between">
      <Typography variant="h4">
        {`Contract`}
      </Typography>
      <LinkToCeramicApi endpoint={contract.id}/>
    </Stack>

    {contract.contractUrl
      ? <Box my={2}>
        <Typography variant="h6">
          {'Contract URL'}
        </Typography>
        <Link to={contract.contractUrl}>{contract.contractUrl}</Link><br/>
      </Box>
      : null
    }

    <Box my={2}>
      <Typography variant="h6">Offered by</Typography>
      <Paper elevation={3} sx={{p: 2}}>
        <IdentifierProfile identifierId={contract.offerer}/>
      </Paper>
    </Box>


    <Box my={2}>
      <Typography variant="h6">Offered at</Typography>
      <Timestamp at={contract.createdAt}/>
    </Box>
    <Box my={2}>
      <Typography variant="h6">ID</Typography>
      <Typography variant="body1">{contract.id}</Typography>
    </Box>

    {contract.state === 'offered'
      ? <Box my={2}>
        <Typography variant="h6" sx={{mt: 2}}>
          Give this ID to the parties you want to sign this contract:
        </Typography>
        <Box sx={{
          '> input': {
            outline: 'none',
            width: '100%',
            fontFamily: 'monospace',
            fontSize: '20px',
            p: 1,
          }
        }}>
          <input type="text" readOnly value={contract.id} onClick={e => { e.target.select() }}/>
        </Box>
      </Box>
      : null
    }

    {contract.state === 'signed' && <>
      <Typography paragraph>Signed by</Typography>
      <Paper elevation={2}>
        <IdentifierProfile identifierId={contract.signer}/>
      </Paper>
    </>}

    {/* <InspectObject object={contract}/> */}
  </Paper>
}




function AckContractSignatureForm({ contract, reloadContract }){
  const [signatureId, setSignatureId] = useState('')

  const ackContractSignature = useAckContractSignature({
    onSuccess(){
      reloadContract()
    },
  })
  const disabled = ackContractSignature.pending
  return <Box {...{
    elevation: 3,
    component: 'form',
    sx: { mt: 2 },
    onSubmit(event){
      event.preventDefault()
      ackContractSignature({
        contractId: contract.id,
        signatureId,
      })
    }
  }}>
    <Typography variant="h6" mb={3}>
      Enter Their Contract Signature ID here
    </Typography>
    <TextField
      label="Contract Signature ID"
      disabled={disabled}
      margin="normal"
      required
      fullWidth
      value={signatureId}
      onChange={e => { setSignatureId(e.target.value) }}
    />
    <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
      <Button type="submit" variant="contained">{`Record Signature`}</Button>
    </Box>
  </Box>
}


function MyContractsList(){
  const [myContracts, {error}] = useMyContracts()

  return (
    <List sx={{
      width: '100%',
      // bgcolor: 'background.paper',
      // flexGrow: 1,
    }}>
      {
        error ? <ErrorMessage {...{error}}/> :
        myContracts ? (
          [...myContracts].sort(sorter).map(contract =>
            <MyContract key={contract.id} contract={contract}/>
          )
        ) :
        Array(3).fill().map((_, i) =>
          <Skeleton key={i} animation="wave" height="100px" />
        )
      }
    </List>
  )
}
const sorter = (a, b) => {
  a = a.createdAt
  b = b.createdAt
  return a < b ? 1 : a > b ? -1 : 0
}

function MyContract({ contract }){
  return <ListItem {...{
    sx: {px: 0},
    secondaryAction: (
      undefined
      // <IconButton edge="end" aria-label="delete" {...{onClick}}>
      //   <DeleteIcon />
      // </IconButton>
    ),
  }}>
    <ListItemButton {...{
      role: undefined,
      dense: true,
      component: Link,
      to: `/contracts/${contract.id}`
    }}>
      <ListItemIcon><ArticleOutlinedIcon/></ListItemIcon>
      <ListItemText {...{
        primaryTypographyProps: {
          sx: {
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
          },
        },
        primary: `${contract.id}`,
        secondary: <span>
          created <Timestamp at={contract.createdAt}/>
        </span>
      }}/>
    </ListItemButton>
  </ListItem>
}
