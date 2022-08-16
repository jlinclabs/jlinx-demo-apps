import * as React from 'react'
import {gunAvatar} from 'gun-avatar'

export default function GunAvatar({ pub, size = 200, ...props }){
  console.log(gunAvatar)
  const src = React.useMemo(
    () => {
      try {
        return gunAvatar({ pub, size })
      }catch(error){
        console.error(error)
        return ''
      }
    },
    [pub, size]
  )
  return <img {...{ ...props, src }}/>
}
