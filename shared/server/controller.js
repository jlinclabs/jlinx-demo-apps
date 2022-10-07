import fs from 'node:fs/promises'
import Path from 'path'
import readDirRecursive from 'recursive-readdir'
import prisma from './prisma.js'
import { InvalidArgumentError } from './errors.js'

export class Controller {
  constructor({ session, userId, readOnly }){
    this.session = session
    this.userId = userId
    this.readOnly = !!readOnly
    // TODO context.queries.auth.currentUser({}) // auto sets context as 2nd arg
    // this.queries = new ProxyThing(queries)
    // this.commands = new ProxyThing(commands)
  }

  async loginAs(userId){
    if (this.session) await this.session.loginAs(userId)
    this.userId = userId
  }

  async logout(){
    if (this.session) await this.session.logout()
    delete this.userId
  }

  async getCurrentUser(){
    return await prisma.user.findUnique({
      where: { id: this.userId },
      select: {
        id: true,
        createdAt: true,
        email: true,
      },
    })
  }

  async query(name, options){
    if (!(name in queries))
      throw new InvalidArgumentError('queryName', name)
    return await queries[name](options, this)
  }

  async command(name, options){
    if (this.readOnly) throw new Error(`cannot exec command in ready only session`)
    if (!(name in commands))
      throw new InvalidArgumentError('commandName', 'name')
    return await commands[name](options, this)
  }
}

export function createController(opts){
  return new Controller(opts)
}

// CONSIDER NOT importing shared by default and instead
// making each app require the bits it want

const queries = await importProcedures([
  Path.join(process.env.SHARED_PATH, 'server/queries'),
  Path.join(process.env.APP_PATH, 'server/queries'),
])

const commands = await importProcedures([
  Path.join(process.env.SHARED_PATH, 'server/commands'),
  Path.join(process.env.APP_PATH, 'server/commands'),
])

console.log({ queries, commands })

if (process.env.NODE_ENV === 'development'){
  queries.__spec = async function(){
    const getArgs = func => func.toString().match(/\(([^)]*)/)[1]
    const spec = {}
    spec.queries = Object.keys(queries)
      .filter(n => n !== '__spec')
      .map(name => ({
        name,
        args: getArgs(queries[name])
      }))
    spec.commands = Object.keys(commands)
      .map(name => ({
        name,
        args: getArgs(commands[name])
      }))
    return spec
  }
}


async function importProcedures(roots){
  console.log({ roots })
  const paths = []
  for (const root of roots){
    try{ await fs.stat(root) }catch(e){ continue }
    (await readDirRecursive(root))
      .map(path => ({
        root,
        path,
        parts: path.match(/(.+).js$/),
      }))
      .filter(p => p.parts)
      .forEach(path => paths.push(path))
  }
  console.log({ paths })

  const modules = await Promise.all(
    paths.map(({path}) => import(path))
  )

  const procedures = {}
  paths.forEach(({root, path, parts}, index) => {
    const name = parts[1].replace(root+'/', '')
    let module = modules[index]
    if (typeof module.default === 'object'){
      module = module.default
    }
    for (const key in module){
      if (key === 'default'){
        procedures[name] = module.default
      }else{
        procedures[`${name}.${key}`] = module[key]
      }
    }
  })
  return procedures
}
