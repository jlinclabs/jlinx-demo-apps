import db from '../prisma/client'
import jlinx from '../jlinx'
import {
  createSigningKeyPair,
  signingKeyToDidDocument,
} from 'jlinx-util'

const identifiers = {
  queries: {
    async byDid({ did }){
      const identifier = await db.identifier.findUnique({
        where: { did },
      })
      console.log({ identifier })
      if (identifier){
        identifier.signingKey = `${did}`.replace(/^did:key:/, '')
        identifier.didDocument = signingKeyToDidDocument(identifier.signingKey)
      }
      console.log({ identifier })
      return identifier
    },

    async forUser(userId){
      return db.identifier.findMany({
        where: { userId }
      })
    }
  },

  commands: {
    async create(data){
      return db.identifier.create({ data })
    },
  },

  actions: {
    async create({ currentUser, ...options }){
      console.log('identifiers.commands.create', options)
      const { publicKey, secretKey } = createSigningKeyPair()
      const didDocument = signingKeyToDidDocument(publicKey)
      const did = didDocument.id
      const identifier = await identifiers.commands.create({
        did,
        userId: currentUser.id,
        secretKey: secretKey.toString('hex'),
      })
      console.log('identifiers.commands.create', identifier)
      return identifier
    },
  },

  views: {
    'mine': async ({ currentUser }) => {
      return currentUser
        ? await identifiers.queries.forUser(currentUser.id)
        : []
    },
    ':did': async ({ did }) => {
      return await identifiers.queries.byDid({ did })
    }
  }
}


export default identifiers
