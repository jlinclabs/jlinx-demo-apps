require('./environment')
const connection = process.env.DATABASE_URL
console.log('process.env.NODE_ENV', process.env.NODE_ENV)

module.exports = {
  client: 'postgresql',
  connection,
  pool: {
    min: 2,
    max: 10
  },
};
