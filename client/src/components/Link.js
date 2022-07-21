import * as React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import MUILink from '@mui/material/Link'

const Link = React.forwardRef((props, ref) =>
  <MUILink component={RouterLink} {...props} ref={ref}/>
)

Link.displayName = 'Link'

export default Link
