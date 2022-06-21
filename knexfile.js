require('./environment')
const connection = process.env.DATABASE_URL
console.log({ connection })

module.exports = {

  development: {
    client: 'pg',
    connection,
    debug: true,
  },

  staging: {
    client: 'pg',
    connection,
  },

  production: {
    client: 'pg',
    connection,
  }

};
