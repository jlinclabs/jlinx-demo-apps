const knexfile = require('./knexfile.js')
const knex = require('knex')(
  knexfile[process.env.NODE_ENV || 'development']
)
knex.ready = async function(){
  return await knex.raw('SELECT 1')
}
module.exports = knex
