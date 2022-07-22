import * as React from 'react'
import Box from '@mui/material/Box'

export default function InspectObject({ object, sx, ...props }){
  let string
  if (typeof object === 'function'){
    string = object.toString()
  }else if (typeof object === 'undefined'){
    string = 'undefined'
  }else{
    try{
      string = inspect(object)
    }catch(error){
      string = `ERROR: ${error}`
    }
  }
  return <Box
    className="InspectObject"
    sx={{
      m: 1,
      backgroundColor: 'background.paper',
      overflow: 'auto',
      whiteSpace: 'pre',
      fontFamily: 'monospace, mono',
      ...sx,
    }}
    {...props}
  >
    {string}
  </Box>
}

function inspect(object, indentation = 2){
  return JSON.stringify(
    object,
    replaceUndefinedWithUndefinedString,
    indentation
  ).replace(/"UNDEFINEDPLACEHOLDER"/g, 'undefined')
}

const replaceUndefinedWithUndefinedString = (k, v) => {
  if (v === undefined) return 'UNDEFINEDPLACEHOLDER'
  if (v instanceof Error) return { message: v.message, stack: v.stack }
  return v
}
