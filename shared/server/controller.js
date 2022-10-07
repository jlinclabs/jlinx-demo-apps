import fs from 'node:fs/promises'
import Path from 'path'
import readDirRecursive from 'recursive-readdir'
import { InvalidArgumentError } from './errors.js'

export class Controller {
  constructor({ userId, readOnly }){
    this.userId = userId
    this.readOnly = !!readOnly
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
  queries.__queries = async function(){
    return Object.keys(queries)
  }
  queries.__commands = async function(){
    return Object.keys(commands)
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
