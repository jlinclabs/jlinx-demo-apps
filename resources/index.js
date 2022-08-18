import pathToRegexp from 'path-to-regexp'
import ceramic from './ceramicResource.js'
import users from './usersResource.js'
import session from './sessionResource.js'
import profiles from './profilesResource.js'
import identifiers from './identifiersResource.js'
import contracts from './contractsResource.js'
import { NotFoundError } from '../errors.js'

const resources = {
  ceramic,
  users,
  session,
  profiles,
  identifiers,
  contracts,
}

export async function getView({ viewId, session }) {
  console.log('GET VIEW', { viewId })

  const [resourceName, viewPart] = parseId(viewId)

  const resource = resources[resourceName]

  let view
  if (resource){
    for (const pattern in resource.views){
      const keys = []
      const regexp = pathToRegexp(pattern, keys)
      const matches = regexp.exec(viewPart)
      if (!matches) continue
      const params = {}
      keys.forEach((key, index) => {
        params[key.name] = matches[index + 1];
      })
      view = { pattern, params }
      break
    }
  }

  if (!view) throw new NotFoundError('view', viewId)

  return await resource.views[view.pattern]({
    ...view.params,
    session: session,
    currentUser: session.user,
  })
}

export async function takeAction({ actionId, options, session }) {
  console.log('TAKE ACTION', { actionId, options, session })
  const [resourceName, actionName] = parseId(actionId)
  const resource = resources[resourceName]
  if (!resource || !resource.actions || !resource.actions[actionName])
    throw new NotFoundError('action', actionId)
  try{
    const result = await resource.actions[actionName]({
      ...options,
      session,
      currentUser: session.user,
    })
    console.log('ACTION COMPLETE', { actionId, options, session, result })
    return result
  }catch(error){
    console.error('ACTION FAILED', { actionId, options, session, error })
    throw error
  }
}



function parseId(actionOrViewId) {
  const matches = actionOrViewId.match(/^([^\.]+)\.(.+$)/);
  return matches ? [matches[1], matches[2]] : [];
}
