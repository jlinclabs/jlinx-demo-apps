import db from '../prisma/client.js'
import jlinx from '../jlinx.js'

const profiles = {
  queries: {
    async byId({ id }){
      return await db.profile.findUnique({
        where: { id },
      })
    },

    async forUser(userId){
      return db.profile.findMany({
        where: { userId }
      })
    }
  },

  commands: {
    create(data){
      return db.profile.create({ data })
    },
  },

  actions: {
    create(){
      const profile = await jlinx.profiles.create()
      const record = await profiles.commands.create({
        id: profile.id,
        userId: currentUser.id,
      })
      console.log('identifiers.commands.create', identifier)
      return identifier
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
