import * as React from 'react'
import LinkToCeramicApi from '../components/LinkToCeramicApi'

export default function LinkToDid({ did, ...props }){
  return <LinkToCeramicApi {...props} endpoint={did}>
    {did}
  </LinkToCeramicApi>
}
