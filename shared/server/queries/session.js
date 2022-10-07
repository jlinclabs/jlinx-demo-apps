export default {
  async get(options, ctx){
    return {
      session: true,
      fake: true,
      static: true,
    }
  },

}

