import db from '../prisma/client.js'
import jlinx from '../jlinx.js'

const profiles = {
  queries: {
    async byId({ id }){
      const record = await db.profile.findUnique({
        where: { id },
        select: { userId: true, createdAt: true }
      })
      const profile = await jlinx.profiles.get(id)
      return profileToJSON({ profile, record })
    },

    async forUser(userId){
      const records = await db.profile.findMany({
        where: { userId }
      })
      return await Promise.all(
        records.map(async record => {
          const profile = await jlinx.profiles.get(record.id)
          return profileToJSON({ profile, record })
        })
      )
    }
  },

  commands: {
    async create({ userId, profile: value }){
      const profile = await jlinx.profiles.create({
        header: ({id}) => ({
          serviceEndpoint: `${process.env.URL}/jlinx/profiles/${id}`
        })
      })
      await profile.set(value)
      console.log('profiles.create', profile, profile.value)
      const record = await db.profile.create({
        data: { id: profile.id, userId },
        select: { userId: true, createdAt: true },
      })
      return profileToJSON({ profile, record })
    },

    async update({ userId, profileId, changes }){

      const record = await db.profile.findUnique({
        where: { id: profileId },
        select: { userId: true, createdAt: true }
      })
      if (record.userId !== userId){
        throw new Error(`you are not authorized to change profile id=${profileId}`)
      }
      const profile = await jlinx.profiles.get(profileId)
      await profile.set(changes)
      return profileToJSON({ profile, record })
    }
  },

  actions: {
    async create({ currentUser, profile }){
      profile = await profiles.commands.create({
        userId: currentUser.id,
        profile,
      })
      console.log('profiles.create', profile)
      return profile
    },
    async update({ currentUser, profileId, changes }){
      const profile = await profiles.commands.update({
        userId: currentUser.id,
        profileId,
        changes,
      })
      console.log('profiles.update', profile)
      return profile
    },
  },

  views: {
    'mine': async ({ currentUser }) => {
      return currentUser
        ? await profiles.queries.forUser(currentUser.id)
        : []
    },
    ':id': async ({ id }) => {
      return await profiles.queries.byId({ id })
    }
  }
}

export default profiles

function profileToJSON({ profile, record }){
  record = record || {}
  const { id, state, ...meta } = profile.toJSON()
  return {
    ...state,
    id,
    meta: {
      ...meta,
      serviceEndpoint: profile.serviceEndpoint,
    },
    createdAt: record.createdAt,
    userId: record.userId,
  }
}
