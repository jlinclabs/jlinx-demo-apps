import prisma from '../lib/prisma'

const counters = {
  queries: {
    get ({ userId, id }) {
      return prisma.counter.findUnique({ where: { userId, id } })
    },
    forUser ({ userId }) {
      return prisma.counter.findUnique({ where: { userId } })
    },
  },

  commands: {
    create({ userId }){
      return prisma.counter.create({
        data: { userId }
      })
    },
    inc({ userId, id }){
      return prisma.counter.update({
        where: { userId, id },
        data: { value: { increment: 1 } },
      })
    },
    dec({ userId, id }){
      return prisma.counter.update({
        where: { userId, id },
        data: { value: { decrement: 1 } },
      })
    },
    delete({ userId, id }){
      return prisma.counter.delete({ where: { userId, id } })
    },
  },

  actions: {
    create({ currentUser }){
      return counters.commands.create({ userId: currentUser.id })
    },
    inc({ currentUser, id }){
      return counters.commands.inc({ userId: currentUser.id, id })
    },
    dec({ currentUser, id }){
      return counters.commands.dec({ userId: currentUser.id, id })
    },
    delete({ currentUser, id }){
      return counters.commands.delete({ userId: currentUser.id, id })
    },
  },

  views: {
    'mine': async ({ currentUser }) => {
      if (!currentUser) return []
      return counters.queries.forUser({ userId: currentUser.id })
    },
    ':id': async ({ id, currentUser }) => {
      if (!currentUser) return null
      return counters.queries.get({ userId: currentUser.id, id })
    }
  }
}


export default counters
