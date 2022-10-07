import bcrypt from 'bcrypt'
import prisma from '_shared/server/prisma.js'
// import Agent from '../../Agent/index.js'
import { isEmail, isPassword } from '../../validators.js'
import { InvalidArgumentError } from '../errors.js'

export async function signup({ password, email }, { session }){
  console.log('SIGNUP', { password, email })
  if (session.agentId)
    throw new Error(`please logout first`)

  if (password && !isPassword(password))
    throw new InvalidArgumentError('password')

  if (email && !isEmail(email))
    throw new InvalidArgumentError('email', email)

  const { agent, didSecret, vaultKey } = await Agent.create()
  console.log('CREATED AGENT', { agent })
  const { id } = await prisma.agent.create({
    data: {
      vaultKey,
      did: agent.did,
      didSecret: didSecret.toString('hex'),
      email,
      passwordHash: password && await hashPassword(password),
    },
    select: {
      id: true,
    }
  })
  await session.setAgentId(id)
  return { did: agent.did }
}

export async function login({ email, password }, { session }){
  const agentRecord = await findAgentByEmail(email)
  console.log({ agentRecord })
  const goodPassword = agentRecord &&
    await checkPassword(password, agentRecord.passwordHash)

  console.log({ goodPassword })

  if (!agentRecord || !goodPassword){
    throw new InvalidArgumentError(`email or password`)
  }
  const { did, didSecret, vaultKey } = agentRecord
  const agent = await Agent.open({ did, didSecret, vaultKey })
  await session.setAgentId(agentRecord.id)
  return { did: agent.did }
}

export async function logout({}, { session }){
  await session.delete()
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

async function hashPassword(password){
  return await bcrypt.hash(password, 10)
}
async function checkPassword(password, passwordHash){
  return await bcrypt.compare(password, passwordHash)
}

// auth idea
// export const foobar = requireAgent((agent, options, context) => {

// })
