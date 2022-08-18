import db from '../prisma/client.js'
import { JlinxClient } from '../jlinx.js'

const profiles = {
  queries: {
    async byId({ id }){
      const record = await db.profile.findUnique({
        where: { id },
        select: { userId: true, createdAt: true }
      })
      const jlinx = new JlinxClient()
      const profile = await jlinx.profiles.get(id)
      return profileToJSON({ profile, record })
    },

    async forUser(userId){
      const records = await db.profile.findMany({
        where: { userId }
      })
      const jlinx = new JlinxClient()
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
      const did = value.did
      const jlinx = new JlinxClient(userId, did)
      const profile = await jlinx.profiles.create(value)
      const record = await db.profile.create({
        data: { id: profile.id.toString(), userId },
        select: { userId: true, createdAt: true },
      })
      return profileToJSON({ profile, record })
    },

    async update({ userId, did, profileId, changes }){
      const record = await db.profile.findUnique({
        where: { id: profileId },
        select: { userId: true, createdAt: true }
      })
      if (record.userId !== userId){
        throw new Error(`you are not authorized to change profile id=${profileId}`)
      }
      const jlinx = new JlinxClient(userId, did)
      const profile = await jlinx.profiles.get(profileId)
      await profile.update({...profile.content, ...changes})
      return profileToJSON({ profile, record })
    }
  },

  actions: {
    async create({ currentUser, profile }){
      return await profiles.commands.create({
        userId: currentUser.id,
        profile,
      })
    },
    async update({ currentUser, did, profileId, changes }){
      return await profiles.commands.update({
        userId: currentUser.id,
        did,
        profileId,
        changes,
      })
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
  const data = {
    ...profile.content,
    id: profile.id.toString(),
    isReadOnly: !!profile.isReadOnly,
  }
  if (record) {
    // data.id = record.id
    data.createdAt = record.createdAt
    data.userId = record.userId
  }
  return data
}
