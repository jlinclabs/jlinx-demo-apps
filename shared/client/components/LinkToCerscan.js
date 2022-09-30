import * as React from 'react'
import Box from '@mui/material/Box'

import Link from '../components/Link'

export default function LinkToCerscan({ id, children, ...props }){
  const to = `https://cerscan.com/testnet-clay/stream/${id}`
  return <Link {...props} to={to} target="_blank">
    {children ?? <CerscanIcon/>}

  </Link>
}

function CerscanIcon(){
  return <Box component="span" sx={{
    verticalAlign: 'bottom',
  }}>
    <img src="https://cerscan.com/img/favicon.png"/>
  </Box>
}
