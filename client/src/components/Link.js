import * as React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import MUILink from '@mui/material/Link'

const Link = React.forwardRef(({...props}, ref) => {
  props.component = RouterLink
  if (props.to && props.to.startsWith('http')){
    props.href = props.to
    delete props.to
    props.rel = props.rel || "noopener noreferrer"
    props.target = props.target || "_blank"
    props.component = 'a'
  }
  return <MUILink {...props} ref={ref}/>
})

Link.displayName = 'Link'

export default Link
