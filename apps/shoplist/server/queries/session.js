import sharedSession from '_shared/server/queries/session.js'
import wait from '_shared/wait.js'

export default {
  async get(options, ctx){
    await wait(2000)
    return {
      modified: true,
      now: Date.now(),
      ...(await sharedSession.get(options, ctx)),
    }
  },
}

