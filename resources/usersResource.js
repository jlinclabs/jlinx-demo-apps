import prisma from '../prisma/client.js'

const users = {
  queries: {

  },

  commands: {

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
