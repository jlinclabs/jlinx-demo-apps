import bcrypt from 'bcrypt'
// import prisma from '../../../prisma/client.js'
// import Agent from '../../Agent/index.js'
// import { isEmail, isPassword } from '../../lib/validators.js'
// import { InvalidArgumentError } from '../../errors.js'

export async function currentAgent({}, { session }){
  if (session?.agent?.did) return { did: session.agent.did }
  return null
}

async function findAgentByEmail(email){
  const record = await prisma.agent.findUnique({
    where: { email },
    select: {
      id: true,
      createdAt: true,
      passwordHash: true,
      did: true,
      didSecret: true,
      vaultKey: true,

    }
  })
  console.log('findAgentByEmail?', record)
  if (record){
    record.didSecret = Buffer.from(record.didSecret, 'hex')
  }
  return record
}
