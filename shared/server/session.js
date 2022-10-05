import Debug from 'debug'
import Cookies from 'cookies'
import prisma from './prisma.js'

const debug = Debug('session')
const COOKIE_NAME = 'session-id'

class Session {
  constructor(req, res){
    this.req = req
    this.res = res
    this.cookies = new Cookies(req, res)
    this.id = this.cookies.get(COOKIE_NAME)
    this.readOnly = req.method !== 'POST'
  }

  [Symbol.for('nodejs.util.inspect.custom')] (depth, opts) {
    let indent = ''
    if (typeof opts.indentationLvl === 'number') { while (indent.length < opts.indentationLvl) indent += ' ' }

    return this.constructor.name + '(\n' +
      indent + '  id: ' + opts.stylize(this.id, 'string') + '\n' +
      indent + '  createdAt: ' + opts.stylize(this.createdAt, 'date') + '\n' +
      indent + '  lastSeenAt: ' + opts.stylize(this.lastSeenAt, 'date') + '\n' +
      indent + '  userId: ' + opts.stylize(this.userId, 'number') + '\n' +
      indent + ')'
  }

  async load(){
    debug('load', this.id)
    let record
    if (this.id) record = await touchSession(this.id)
    if (!record) {
      record = await createSession()
      this.id = record.id
      this.cookies.set(COOKIE_NAME, this.id, { httpOnly: true })
    }
    debug('loaded', record)
    this.createdAt = record.createdAt
    this.lastSeenAt = record.lastSeenAt
    this.userId = record.user?.id
    this.user = record.user
  }

  async clear(){

  }
}

export async function loadSession(req, res){
  req.session = new Session(req, res)
  await req.session.load()
}



async function createSession(){
  return await prisma.session.create({
    data: {},
    select: {
      id: true,
      createdAt: true,
      lastSeenAt: true,
    }
  })
}

async function touchSession(id){
  const record = await prisma.session.update({
    where: { id },
    data: { lastSeenAt: new Date },
    select: {
      id: true,
      createdAt: true,
      lastSeenAt: true,
      user: {
        select: {
          id: true,
          createdAt: true,
        }
      },
    }
  }).catch(error => {
    if (
      error instanceof prisma.Error &&
      error.code === 'P2025'
    ) return null
    throw error
  })
  // if (record && record.agent){
  //   record.agent.didSecret = Buffer.from(record.agent.didSecret, 'hex')
  // }
  return record
}

async function setSessionAgentId(id, agentId){
  console.log('setSessionAgentId', {id, agentId})
  await prisma.session.update({
    where: { id },
    data: { agentId }
  })
}

async function deleteSession(id){
  console.log('deleteSession', {id})
  try{
    await prisma.session.delete({
      where: { id }
    })
  }catch(error){
    console.error('failed to delete session', error)
    if (
      error instanceof prisma.Error &&
      error.code === 'P2025'
    ) return null
    throw error
  }
}
