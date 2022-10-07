import bcrypt from 'bcrypt'
import prisma from '../prisma.js'
import { isEmail, isPassword } from '../../validators.js'
import { InvalidArgumentError } from '../errors.js'

export async function signup({ email, password }, context){
  console.log('SIGNUP', { email, password, context })
  if (context.userId)
    throw new Error(`please logout first`)

  if (password && !isPassword(password))
    throw new InvalidArgumentError('password')

  if (email && !isEmail(email))
    throw new InvalidArgumentError('email', email)

  const { id } = await prisma.user.create({
    data: {
      email,
      passwordHash: password && await hashPassword(password),
    },
    select: {
      id: true,
    }
  })
  await context.loginAs(id)
  return { id }
}

export async function login({ email, password }, context){
  console.log('LOGIN', { email, password, context })
  if (context.userId)
    throw new Error(`please logout first`)
  const record = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  })
  const passwordMatches = (
    record &&
    await checkPassword(password, record.passwordHash)
  )
  if (!passwordMatches) throw new InvalidArgumentError(`email or password`)
  context.loginAs(record.id)
  return { userId: record.id }
  // const agentRecord = await findAgentByEmail(email)
  // console.log({ agentRecord })
  // const goodPassword = agentRecord &&
  //   await checkPassword(password, agentRecord.passwordHash)

  // console.log({ goodPassword })

  // if (!agentRecord || !goodPassword){
  //   throw new InvalidArgumentError(`email or password`)
  // }
  // const { did, didSecret, vaultKey } = agentRecord
  // const agent = await Agent.open({ did, didSecret, vaultKey })
  // await session.setAgentId(agentRecord.id)
  // return { did: agent.did }
}

export async function logout({}, context){
  await context.logout()
  return null
}

async function hashPassword(password){
  return await bcrypt.hash(password, 10)
}
async function checkPassword(password, passwordHash){
  return await bcrypt.compare(password, passwordHash)
}
