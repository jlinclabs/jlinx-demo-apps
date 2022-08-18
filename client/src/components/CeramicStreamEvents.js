import * as React from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import ErrorMessage from '../components/ErrorMessage'
import InspectObject from '../components/InspectObject'

import { useCeramicStreamEvents } from '../resources/ceramic'
export default function CeramicStreamEvents({ id, ...props }){
  const [events, request] = useCeramicStreamEvents(id)
  return <Box {...props}>
    {
      request.loading ? <CircularProgress/> :
      request.error ? <ErrorMessage error={request.error}/> :
      events.map((event, index) =>
        <InspectObject key={index} object={event}/>
      )
    }
  </Box>
}
