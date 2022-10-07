import bcrypt from 'bcrypt'
// import prisma from '../../../prisma/client.js'
// import Agent from '../../Agent/index.js'
// import { isEmail, isPassword } from '../../lib/validators.js'
// import { InvalidArgumentError } from '../../errors.js'

export async function currentUser({}, context){
  return context.userId ? await context.getCurrentUser() : null
}

// async function findAgentByEmail(email){
//   const record = await prisma.agent.findUnique({
//     where: { email },
//     select: {
//       id: true,
//       createdAt: true,
//       passwordHash: true,
//       did: true,
//       didSecret: true,
//       vaultKey: true,
//     }
//   })
//   console.log('findAgentByEmail?', record)
//   if (record){
//     record.didSecret = Buffer.from(record.didSecret, 'hex')
//   }
//   return record
// }
