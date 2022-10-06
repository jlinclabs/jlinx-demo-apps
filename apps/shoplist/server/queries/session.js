import sharedSession from '_shared/server/queries/session.js'
export default {
  async get(options, ctx){
    return {
      modified: true,
      ...(await sharedSession.get(options, ctx)),
    }
  },
}

