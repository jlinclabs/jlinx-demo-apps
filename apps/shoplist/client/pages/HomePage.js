import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

import InspectObject from 'jlinx-demo-app/client/components/InspectObject'
// import { useCurrentAgent } from '../resources/auth'
// import LinkToDid from '../components/LinkToDid'
// import CopyButton from '../components/CopyButton'

export default function HomePage() {
  // const { currentAgent } = useCurrentAgent()
  return <Box p={2}>
    <Paper>
      <Typography variant="h3">Shop List</Typography>
      <InspectObject object={{hello: 'world'}}/>
    </Paper>
  </Box>
}
