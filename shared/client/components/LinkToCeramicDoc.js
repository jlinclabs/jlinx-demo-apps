import * as React from 'react'
import FindInPageIcon from '@mui/icons-material/FindInPage'

import Link from '../components/Link'

export default function LinkToCeramicApi({ id, children, ...props }){
  return <Link {...props} to={`/api/ceramic/${id}`} target="_blank">
    {children ?? <FindInPageIcon/>}
  </Link>
}

