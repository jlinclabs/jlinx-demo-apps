import Path from 'path'
import b4a from 'b4a'
import JlinxClient from 'jlinx-client'
// const exitHook = require('exit-hook')
// import exitHook from 'exit-hook'

const {
  JLINX_HOST,
  JLINX_VAULT_PATH,
  JLINX_VAULT_KEY,
} = process.env

const jlinx = new JlinxClient({
  hostUrl: JLINX_HOST,
  vaultPath: JLINX_VAULT_PATH,
  vaultKey: b4a.from(JLINX_VAULT_KEY, 'hex')
})

console.log({jlinx})

export default jlinx

// exitHook(() => { jlinx.destroy() });
import('exit-hook').then(fuck => {
  console.log(fuck)
})
// exitHook(() => { jlinx.destroy() });
