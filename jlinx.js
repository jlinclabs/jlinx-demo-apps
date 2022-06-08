const Path = require('path')
const b4a = require('b4a')
const appConfig = require('./appConfig')
const JlinxClient = require('jlinx-client')

console.log({appConfig})

const jlinx = new JlinxClient({
  hostUrl: appConfig.jlinxHost,
  vaultPath: Path.join(appConfig.APP_DIR, 'jlinx.vault'),
  vaultKey: b4a.from(appConfig.jlinxVaultKey, 'hex')
})

console.log({jlinx})

module.exports = jlinx
