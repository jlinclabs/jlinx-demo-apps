import prisma from '../prisma/client.js'

const users = {
  queries: {

  },

  commands: {
    async create({ secretKeyHash, secretKeySalt }){
      const record = await prisma.user.create({
        data: {
          secretKeyHash,
          secretKeySalt,
        }
      })
      return record
    }
  },

  actions: {
    signup(){

    },
    login(){

    },
  },

  views: {
    'current': async ({ currentUser }) => {
      return currentUser || null
    },
    ':id': async ({ id }) => {
      // session
    }
  }
}


export default users
