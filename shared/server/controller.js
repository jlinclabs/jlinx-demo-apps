import Path from 'path'
import { fileURLToPath } from 'url'

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



async function importProcedures(){
  // TODO reduce this function to some helpers
  const __dirname = Path.dirname(fileURLToPath(import.meta.url))
  const root = __dirname + '/procedures'
  const paths = (await readDirRecursive(root))
    .map(path => Path.relative(root, path))
    .map(path => ({
      path,
      parts: path.match(/(.+).js$/),
    }))
    .filter(({parts}) => parts)
  const modules = await Promise.all(
    paths.map(({path}) => import('./procedures/' +  path))
  )
  const procedures = {}
  paths.forEach(({path, parts}, index) => {
    const name = parts[1].replace('/', '.')
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
