const JlinxClient = require('jlinx-client')

const jlinx = new JlinxClient({
  vaultPath: Path.join(appConfig.APP_DIR, 'jlinx.vault'),
  vaultKey: appConfig.VAULT_KEY,
})

module.exports = jlinx
