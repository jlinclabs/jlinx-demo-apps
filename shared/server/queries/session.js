export default {
  async get(options, context){
    return {
      id: context.session.id,
      userId: context.userId,
    }
  },
}

