import Debug from 'debug'
import Cookies from 'cookies'
import prisma from '../prisma/client.js'
const COOKIE_NAME = 'session-id'

const debug = Debug('session')

export default class Session {

  static async open(req, res){
    debug('OPEN', req.method, req.url)
    const session = new Session(req, res)
    debug('OPEN', 'session.id', session.id)
    if (session.id) await session.load()
    else await session.create()
    return session
  }

  constructor(req, res){
    this._cookies = new Cookies(req, res)
    this._id = this._cookies.get(COOKIE_NAME)
  }

  get id(){ return this._id }
  get createdAt(){ return this._createdAt }
  get lastSeenAt(){ return this._lastSeenAt }
  get user(){ return this._user }

  async create(){
    debug('create')
    const record = await createSession({
      data: {},
      select: {
        id: true,
        createdAt: true,
        lastSeenAt: true,
      }
    })
    debug('created', record.id)
    this._cookies.set(COOKIE_NAME, record.id, { httpOnly: true })
    this._id = record.id
    this._createdAt = record.createdAt
    this._lastSeenAt = record.lastSeenAt
  }

  async load(){
    debug('load', this.id)
    const record = await touchSession(this.id)
    if (!record) return await this.create()
    debug('loaded', record)
    this._createdAt = record.createdAt
    this._lastSeenAt = record.lastSeenAt
    if (record.user){
      const { did, didSecret, vaultKey } = record.user
      this._user = await Agent.open({
        did, didSecret, vaultKey
      })
    }
  }

  async delete(){
    debug('delete', this.id)
    await deleteSession(this.id)
    this._cookies.set(COOKIE_NAME, undefined)
  }

  async setAgentId(userId){
    if (this.userId){ throw new Error(`please logout first`) }
    await setSessionAgentId(this.id, userId)
    await this.load()
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

  async ensureLoggedIn(){
    if (!this.user) throw new Error(`not logged in`)
  }

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
          createdAt: true,
          did: true,
          didSecret: true,
          vaultKey: true,
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
  if (record && record.user){
    record.user.didSecret = Buffer.from(record.user.didSecret, 'hex')
  }
  return record
}

async function setSessionAgentId(id, userId){
  console.log('setSessionAgentId', {id, userId})
  await prisma.session.update({
    where: { id },
    data: { userId }
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
