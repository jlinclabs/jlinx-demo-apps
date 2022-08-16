import Debug from 'debug'
import ceramic, { TileDocument } from './ceramic.js'

const debug = Debug('jlinx')

export class JlinxClient {

  static createDid(){

  }

  constructor(did){
    debug('new JlinxClient', { did })
    this.did = did
    // this.userId  = userId
    this.identifiers = new JlinxIdentifiers(this)
    this.profiles = new JlinxProfiles(this)
  }

  async get(id, opts = {}){
    const doc = await TileDocument.load(
      ceramic,
      id,
      {...opts}
    )
    console.log('loaded', doc.id)
    return doc
  }

  async create(content, opts = {}){
    const doc = await TileDocument.create(
      ceramic,
      content,
      metadata,
      {
        asDID: this.did
      }
    )
    return doc
  }
}

class JlinxPlugin {
  constructor(jlinxClient){
    this.jlinxClient = jlinxClient
  }
  async create(){

  }
  async get(){

  }
}

class JlinxIdentifiers extends JlinxPlugin {
  async create(){

  }
  async get(){

  }
}

class JlinxProfiles extends JlinxPlugin {
  async create(...opts){
    const doc = await this.jlinxClient(...opts)
    return new Profile(this, doc)
  }
  async get(){
    return new Profile(this, doc)
  }
}

class Profile {
  constructor(jlinxClient, doc){
    this.jlinxClient = jlinxClient
    this.doc = doc
  }
}



// import Path from 'path'
// import b4a from 'b4a'
// import JlinxClient from 'jlinx-client'
// import JlinxIdentifiers from 'jlinx-client/Identifiers.js'
// import JlinxProfiles from 'jlinx-client/Profiles.js'
// import JlinxContracts from 'jlinx-client/Contracts.js'
// import exitHook from 'exit-hook'

// const {
//   JLINX_HOST,
//   JLINX_VAULT_PATH,
//   JLINX_VAULT_KEY,
// } = process.env

// const jlinx = new JlinxClient({
//   hostUrl: JLINX_HOST,
//   vaultPath: JLINX_VAULT_PATH,
//   vaultKey: b4a.from(JLINX_VAULT_KEY, 'hex')
// })

// jlinx.identifiers = new JlinxIdentifiers(jlinx)
// jlinx.profiles = new JlinxProfiles(jlinx)
// jlinx.contracts = new JlinxContracts(jlinx)

// console.log({jlinx})

// export default jlinx

// exitHook(() => { jlinx.destroy() });
