import * as React from 'react'
import FindInPageIcon from '@mui/icons-material/FindInPage'

import Link from '../components/Link'

export default function LinkToCeramicApi({ endpoint, children, ...props }){
  return <Link {...props} to={`/api/ceramic/${endpoint}`} target="_blank">
    {children ?? <FindInPageIcon/>}
  </Link>
}
