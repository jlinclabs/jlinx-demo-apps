import db from '../prisma/client.js'
import { JlinxClient } from '../jlinx.js'
import profiles from './profilesResource.js'

const identifiers = {
  queries: {
    async byId({ id }){
      const record = await db.identifier.findUnique({
        where: { id },
        select: { userId: true, createdAt: true }
      })
      const jlinx = new JlinxClient()
      const identifier = await jlinx.identifiers.get(id)
      return identifierToJSON({ identifier, record })
    },

    async forUser(userId){
      const records = await db.identifier.findMany({
        where: { userId }
      })
      return await Promise.all(
        records.map(async record => {
          const jlinx = new JlinxClient()
          const identifier = await jlinx.identifiers.get(record.id)
          return identifierToJSON({ identifier, record })
        })
      )
    }
  },

  commands: {
    async create({ userId }){
      console.log('identifiers.commands.create', { userId })
      const jlinx = new JlinxClient()
      const identifier = await jlinx.identifiers.create()
      console.log({ identifier })
      const record = await db.identifier.create({
        data: { id: identifier.id, userId },
        select: { userId: true, createdAt: true },
      })
      console.log({ record })
      return identifierToJSON({ identifier, record })
    },
  },

  actions: {
    async create({ currentUser, profileId }){
      const identifier = await identifiers.commands.create({
        userId: currentUser.id,
        profileId
      })
      console.log('identifiers.create', identifier)
      return identifier
    },
  },

  views: {
    'mine': async ({ currentUser }) => {
      return currentUser
        ? await identifiers.queries.forUser(currentUser.id)
        : []
    },
    ':id': async ({ id }) => {
      return await identifiers.queries.byId({ id })
    }
  }
}

export default identifiers

function identifierToJSON({ identifier, record }){
  record = record || {}
  const profileService = identifier.state.services
    .find(service => service.type === 'jlinx.profile')
  return {
    ...identifier.toJSON(),
    createdAt: record.createdAt,
    userId: record.userId,
    didDocument: identifier.asDidDocument(),
    profileId: profileService ? profileService.id : undefined,
  }
}
