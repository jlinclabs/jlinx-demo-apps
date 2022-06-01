const Path = require('path')
const b4a = require('b4a')
const appConfig = require('./appConfig')
const JlinxClient = require('jlinx-client')

console.log({appConfig})

const jlinx = new JlinxClient({
  vaultPath: Path.join(appConfig.APP_DIR, 'jlinx.vault'),
  vaultKey: b4a.from(appConfig.jlinxVaultKey, 'hex'),
  hostUrl: appConfig.jlinxHost
})

module.exports = jlinx
