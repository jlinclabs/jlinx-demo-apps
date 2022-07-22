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

import { useMyContracts } from '../resources/contracts'
import Layout from '../Layout'
import Link from '../components/Link'
import Timestamp from '../components/Timestamp'
import ErrorMessage from '../components/ErrorMessage'

export default function Contracts(props) {
  console.log('PAGE/contacts/index', props)

  return <Layout title="Contracts" requireLoggedIn>
    <Container maxwidth="lg">
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
  </Layout>
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
