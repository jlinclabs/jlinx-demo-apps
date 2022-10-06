export default {
  async get(options, ctx){
    return {
      session: true,
      fake: true,
      static: true,
    }
  },

  async delete(options, ctx){
    ctx.userId

  }
}

