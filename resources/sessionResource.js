import bcrypt from 'bcrypt'
import prisma from '../prisma/client.js'
import { createDid } from '../ceramic.js'
import { JlinxClient } from '../jlinx.js'
import users from './usersResource.js'

const sessionResource = {

  queries: {
    async get(sessionId){
      return await prisma.session.findUnique({
        where: { id: sessionId },
        select: {
          id: true,
          createdAt: true,
          lastSeenAt: true,
          userId: true,
          user: {
            select: {
              id: true,
              // did: true,
              // email: true,
              // name: true,
              createdAt: true,
            }
          },
        }
      })
    }
  },

  commands: {
    async create(){
      return await prisma.session.create({ data: {} })
    },
    async touch(id){
      return await prisma.session.update({
        where: { id },
        data: { lastSeenAt: new Date }
      })
    },
    async setUserId(id, userId){
      console.log('setUserId', {id, userId})
      return await prisma.session.update({
        where: { id },
        data: { userId }
      })
    },
    async delete(id){
      return await prisma.session.delete({
        where: { id }
      })
    }
  },

  actions: {

    async signup({ session, secretKey }){
      console.log('signup', { session, secretKey })
      if (session.userId){
        throw new Error(`please logout first`)
      }
      // const secretKeySalt = await bcrypt.genSalt(10)
      // const secretKeyHash = await bcrypt.hash(secretKey, secretKeySalt)
      // const { did, seed: didSeed } = await createDid()
      // const user = await prisma.user.create({
      const user = await users.commands.create({ secretKey })

      await session.setUserId(user.id)
      // await session.save();
    },

    async login({ session, secretKey }){
      const user = await users.queries.findBySecretKey(secretKey)
      // const match = await bcrypt.compare(password, user.passwordHash)
      if (!user){ throw new Error(`invalid email or password`)}
      await session.setUserId(user.id)
    },

    async logout({ session }){
      await session.delete()
    }
  },

  views: {
    'current': async ({ session }) => {
      return {...session}
    },

    'currentUser': async ({ session }) => {
      return session.user || null
      // if (!session.userId) return null
      // return await prisma.user.findUnique({
      //   where: { id: session.userId },
      //   select: {
      //     id: true,
      //     email: true,
      //     name: true,
      //     createdAt: true,
      //   }
      // })
    },
  }
}


export default sessionResource
