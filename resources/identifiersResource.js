import db from '../prisma/client.js'
import jlinx from '../jlinx.js'
import profiles from './profilesResource.js'

const identifiers = {
  queries: {
    async byId({ id }){
      const record = await db.identifier.findUnique({
        where: { id },
        select: { userId: true, createdAt: true }
      })
      const identifier = await jlinx.identifiers.get(id)
      return identifierToJSON({ identifier, record })
    },

    async forUser(userId){
      const records = await db.identifier.findMany({
        where: { userId }
      })
      return await Promise.all(
        records.map(async record => {
          const identifier = await jlinx.identifiers.get(record.id)
          return identifierToJSON({ identifier, record })
        })
      )
    }
  },

  commands: {
    async create({ userId, profileId }){
      console.log('identifiers.commands.create', { userId, profileId })

      const profile = profileId
        ? await profiles.queries.byId({ id: profileId })
        : null
        if (profile && profile.userId !== userId) profile = null

      const identifier = await jlinx.identifiers.create()
      if (profile) {
        console.log('identifiers.commands.create', { profile })
        await identifier.addService({
          id: profile.id,
          type: 'jlinx.profile',
          serviceEndpoint: profile.serviceEndpoint,
        })
      }

      const record = await db.identifier.create({
        data: { id: identifier.id, userId },
        select: { userId: true, createdAt: true },
      })
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
