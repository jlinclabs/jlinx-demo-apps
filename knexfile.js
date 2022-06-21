require('./environment')
const connection = process.env.DATABASE_URL

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
