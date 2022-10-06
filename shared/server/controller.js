import Path from 'path'
import { fileURLToPath } from 'url'
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

const queries = await importProcedures('server/queries')
const commands = await importProcedures('server/commands')

console.log({ queries, commands })

if (process.env.NODE_ENV === 'development'){
  queries.__queries = async function(){
    return Object.keys(queries)
  }
  queries.__commands = async function(){
    return Object.keys(commands)
  }
}

async function importProcedures(path){
  const root = Path.join(process.env.APP_PATH, path)
  // TODO: if dir doesnt exist return []
  const paths = (await readDirRecursive(root))
    .map(path => ({
      path,
      parts: path.match(/(.+).js$/),
    }))
    .filter(({parts}) => parts)

  const modules = await Promise.all(
    paths.map(({path}) => import(path))
  )

  const procedures = {}
  paths.forEach(({path, parts}, index) => {
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
