import Path from 'path'
import { fileURLToPath } from 'url'
import readDirRecursive from 'recursive-readdir'

export class Controller {
  constructor({ userId, readOnly }){
    this.userId = userId
    this.readOnly = !!readOnly
  }

  async query(name, options){

  }

  async command(name, options){

  }
}

export function createController(opts){
  return new Controller(opts)
}

const queries = await importProcedures('server/queries')
const commands = await importProcedures('server/commands')

console.log({ queries, commands })

async function importProcedures(path){
  // TODO reduce this function to some helpers
  // const __dirname = Path.dirname(fileURLToPath(import.meta.url))
  // const root = __dirname + '/procedures'
  // console.log('process.env.APP_PATH', process.env.APP_PATH)
  const root = Path.join(process.env.APP_PATH, path)
  console.log('importing from', root)
  // TODO: if dir exists
  const paths = (await readDirRecursive(root))
    // .map(path => Path.relative(root, path))
    .map(path => ({
      path,
      parts: path.match(/(.+).js$/),
    }))
    .filter(({parts}) => parts)
  console.log({ paths })
  const modules = await Promise.all(
    paths.map(({path}) => import(path))
  )
  console.log({ modules })

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
