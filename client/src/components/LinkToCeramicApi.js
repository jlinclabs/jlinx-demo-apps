import * as React from 'react'
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch'

import Link from '../components/Link'

export default function LinkToCeramicApi({ endpoint, children, ...props }){
  return <Link {...props} to={`/api/ceramic/${endpoint}`} target="_blank">
    {children ?? <ContentPasteSearchIcon/>}
  </Link>
}
