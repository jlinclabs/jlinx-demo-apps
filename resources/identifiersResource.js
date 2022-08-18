import db from '../prisma/client.js'
import { createDid } from '../ceramic.js'
import { JlinxClient } from '../jlinx.js'
import profiles from './profilesResource.js'

const identifiers = {
  queries: {
    async getSecretSeed({ userId, did }){
      console.log('GET SECRET SEED', { userId, did })
      if (!userId) throw new Error(`userId is required`)
      if (!did) throw new Error(`did is required`)
      const record = await db.identifier.findUnique({
        where: {
          // userId,
          id: did,
        },
        select: {
          userId: true,
          secretSeed: true,
        }
      })
      if (record && record.userId === userId) {
        return Buffer.from(record.secretSeed, 'hex')
      }
    },

    async byId({ id, userId }){
      const record = await db.identifier.findUnique({
        where: { id },
        select: {
          id: true,
          userId: true,
          createdAt: true,
          secretSeed: true,
        }
      })
      const did = await getDidFromCeramic({ userId, id, record })
      return identifierToJSON({ userId, record, did })
    },

    async forUser(userId){
      const records = await db.identifier.findMany({
        where: { userId },
        select: {
          id: true,
          userId: true,
          createdAt: true,
          secretSeed: true,
        }
      })
      return await Promise.all(
        records.map(async record => {
          const did = await getDidFromCeramic({ userId, id: record.id, record })
          return identifierToJSON({ userId, record, did })
        })
      )
    }
  },

  commands: {
    async create({ userId }){
      console.log('identifiers.commands.create', { userId })
      const jlinx = new JlinxClient()
      const did = await jlinx.dids.create()
      console.log('identifiers.commands.create', { did })
      await db.identifier.create({
        data: {
          id: did.id,
          userId,
          secretSeed: did.secretSeed.toString('hex'),
        }
      })
      return did.id
      // console.log({ record })
      // return identifierToJSON({ identifier, record })
    },
  },

  actions: {
    async create({ currentUser, profileId }){
      const id = await identifiers.commands.create({
        userId: currentUser.id,
        profileId
      })
      console.log('identifiers.create', id)
      return id
    },
  },

  views: {
    'mine': async ({ currentUser }) => {
      return currentUser
        ? await identifiers.queries.forUser(currentUser.id)
        : []
    },
    ':id': async ({ currentUser, id }) => {
      return await identifiers.queries.byId({ id, userId: currentUser.id })
    }
  }
}

export default identifiers

async function getDidFromCeramic({ userId, id, record }){
  let secretSeed
  if (record && record.userId === userId) {
    secretSeed = Buffer.from(record.secretSeed, 'hex')
  }
  const jlinx = new JlinxClient()
  return await jlinx.dids.get(id, secretSeed)
}

function identifierToJSON({ userId, record, did }){
  let data
  if (record){
    data = data || {}
    data.id = record.id
    data.createdAt = record.createdAt
    data.ours = record.userId === userId
  }
  if (did){
    data = data || {}
    data.id = did.id
    data.didDocument = did.didDocument
  }
  return data
}
