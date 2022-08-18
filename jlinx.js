import Debug from 'debug'
import crypto from 'crypto'
import { randomBytes } from '@stablelib/random'
import ceramic, { TileDocument, createDid, getDid, resolveDidDocument } from './ceramic.js'

import identifiersResource from './resources/identifiersResource.js'

const debug = Debug('jlinx')

export class JlinxClient {

  constructor(userId, did){
    debug('new JlinxClient', { userId, did })
    this.userId = userId
    this.did = did
    this.readOnly = !!(this.userId && this.did)
    this.dids = new JlinxDids(this)
    this.profiles = new JlinxProfiles(this)
    this.contracts = new JlinxContracts(this)
  }

  async getDid(){
    if (this._did) return this._did
    const { userId, did } = this
    // go get the private key from the db
    const secretSeed = await identifiersResource.queries.getSecretSeed({ userId, did })
    if (!secretSeed){
      throw new Error(`unable to get secretSeed for userId="${userId}" did="${did}"`)
    }
    this._did = await getDid(did, secretSeed)
    return this._did
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

  async create(content, { metadata, ...opts } = {}){
    const doc = await TileDocument.create(
      ceramic,
      content,
      metadata,
      {
        ...opts,
        asDID: await this.getDid()
      }
    )
    return doc
  }
}

class JlinxPlugin {
  constructor(jlinxClient){
    this.jlinxClient = jlinxClient
  }
}

class JlinxDocument {
  constructor(jlinxClient, doc){
    this.jlinxClient = jlinxClient
    this.doc = doc // a ceramic tile stream
  }
  get id(){ return this.doc.id }
  get content(){ return this.doc.content }
  get controllers(){ return this.doc.controllers }
  toJSON(){ return this.content }

  async sync(){
    await this.doc.sync({
      // sync: SyncOptions.SYNC_ALWAYS // TODO
    })
  }

  async update(content, metadata, opts = {}) {
    await this.doc.update(content, metadata, {
      asDID: await this.jlinxClient.getDid(),
      ...opts
    })
    await this.sync()
    // TODO consider this.doc.requestAnchor()
  }

  async patch(patch, metadata, opts = {}) {
    const content = {...this.content, ...patch}
    await this.update(content, metadata, opts = {})
  }
}

class JlinxDids extends JlinxPlugin {
  async create(...opts){
    const { jlinxClient } = this
    const { did, secretSeed } = await createDid(...opts)
    const didDocument = await resolveDidDocument(did.id)
    return new Did({
      jlinxClient,
      did,
      secretSeed,
      didDocument,
    })
  }
  async get(didString, secretSeed){
    // const did = await getDid(didString, secretSeed)
    // return new Did(this, did, secretSeed)
    const { jlinxClient } = this
    const did = secretSeed ? await getDid(didString, secretSeed) : undefined
    const didDocument = await resolveDidDocument(didString)
    return new Did({
      jlinxClient,
      // did,
      secretSeed,
      didDocument,
    })
  }
}

class Did {
  constructor(opts = {}){
    this.jlinxClient = opts.jlinxClient
    this.did = opts.did
    this.secretSeed = opts.secretSeed
    this.didDocument = opts.didDocument
  }
  get id () { return this.didDocument.id }
}


class JlinxProfiles extends JlinxPlugin {
  async create(content, opts = {}){
    const doc = await this.jlinxClient.create(
      content,
      {...opts}, // TODO { schema }
    )
    return new Profile(this.jlinxClient, doc)
  }
  async get(...opts){
    const doc = await this.jlinxClient.get(...opts)
    return new Profile(this.jlinxClient, doc)
  }
}

class Profile extends JlinxDocument {
  get name(){ return this.content.name }
  get avatar(){ return this.content.avatar }
}


class JlinxContracts extends JlinxPlugin {
  async create(...opts){
    console.log('JlinxContracts.create', this, opts)
    const doc = await this.jlinxClient.create(...opts)
    return new Contract(this.jlinxClient, doc)
  }

  async get(...opts){
    const doc = await this.jlinxClient.get(...opts)
    return new Contract(this.jlinxClient, doc)
  }

  async offerContract(opts = {}){
    const {
      offerer = this.jlinxClient,
      contractUrl,
      signatureDropoffUrl
    } = opts
    return this.create({
      state: 'offered',
      offerer,
      contractUrl,
      signatureDropoffUrl
    })
  }

  async getSignature(...opts){
    const doc = await this.jlinxClient.get(...opts)
    return new ContractSignature(this.jlinxClient, doc)
  }
}

class Contract extends JlinxDocument {

  get state(){ return this.content?.state }
  get offerer(){ return this.content?.offerer }
  get contractUrl(){ return this.content?.contractUrl }
  get signatureDropoffUrl(){ return this.content?.signatureDropoffUrl }
  get signatureId(){ return this.content?.signatureId }

  async offerContract(opts = {}){
    console.log('Offer Contract', this, this.doc)
    const {
      offerer,
      contractUrl,
      signatureDropoffUrl
    } = opts
    await this.patch({
      state: 'offered',
      offerer,
      contractUrl,
      signatureDropoffUrl
    })
  }

  async sign(){
    const signature = await this.jlinxClient.create({
      contractId: this.id.toString(),
      identifierId: this.jlinxClient.did,
    })
    console.log('CREATED SIGNATURE', {
      signature,
      'signature.content': signature.content,
      'signature.controllers': signature.controllers,
    })
    return signature
  }

  async ackSignature(signature){
    if (this.state !== 'offered'){
      throw new Error(`contract not in "offered" state.`)
    }
    await signature.sync()
    if (signature.content.contractId !== this.id.toString()){
      throw new Error(`signature.contractId does not match contract.id`)
    }
    const signer = signature.controllers[0]
    if (!signer){
      throw new Error(`signature has no controllers`)
    }
    await this.patch({
      state: 'signed',
      signatureDropoffUrl: undefined,
      signatureId: signature.id.toString(),
      signer,
    })
  }
}

class ContractSignature extends JlinxDocument {
  get contractId(){ return this.content?.contractId }
  get identifierId(){ return this.content?.identifierId }
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
