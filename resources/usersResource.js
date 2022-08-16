import prisma from '../prisma/client.js'

const users = {
  queries: {
    async findBySecretKey(secretKey){
      return await prisma.user.findUnique({
        where: { secretKey },
        select: {
          id: true,
          createdAt: true,
        }
      })
    }

  },

  commands: {
    async create({ secretKey }){
      return await prisma.user.create({
        data: { secretKey }
      })
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
