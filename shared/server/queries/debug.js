export default {
  async ping(options, ctx){
    return {
      pong: true,
      options,
    }
  },
}

