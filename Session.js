import Cookies from 'cookies'
import sessionResource from './resources/sessionResource'
const COOKIE_NAME = 'session-id'

export default class Session {

  static async open(req, res){
    const session = new Session(req, res)
    if (session.id) await session.reload()
    if (!session.createdAt) {
      console.log('Session create')
      session._value = await sessionResource.commands.create()
      session._id = session._value.id
      session._cookies.set(COOKIE_NAME, session.id, { httpOnly: true })
    }else{
      await session.touch()
    }
    return session
  }

  constructor(req, res){
    this._cookies = new Cookies(req, res)
    this._id = this._cookies.get(COOKIE_NAME)
  }

  get id(){ return this._id }
  get createdAt(){ return this._value?.createdAt }
  get lastSeenAt(){ return this._value?.lastSeenAt }
  get user(){ return this._value?.user }
  get userId(){ return this._value?.userId }

  async reload(){
    console.log('Session reload')
    this._value = await sessionResource.queries.get(this.id)
  }

  async touch(){
    console.log('Session touch')
    await sessionResource.commands.touch(this.id)
  }

  async delete(){
    console.log('Session delete')
    await sessionResource.commands.delete(this.id)
    this._cookies.set(COOKIE_NAME, undefined)
  }

  async setUserId(userId){
    if (this.userId){ throw new Error(`please logout first`) }
    await sessionResource.commands.setUserId(this.id, userId)
    await this.reload()
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

}
