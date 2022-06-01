const appConfig = require('./appConfig')
const connection = appConfig.postgresDatabaseUrl

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
