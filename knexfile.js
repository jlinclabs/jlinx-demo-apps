const env = require('./environment')
const connection = env.postgresDatabaseUrl

module.exports = {

  development: {
    client: 'pg',
    connection,
    // debug: true,
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
