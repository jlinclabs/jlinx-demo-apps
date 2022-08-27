import prisma from '../prisma/client.js'

const users = {
  queries: {
    async findByEmail(email){
      return await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          createdAt: true,
        }
      })
    }
  },

  commands: {
    async create({ email }){
      return await prisma.user.create({
        data: { email }
      })
    }
  },

  actions: {

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
