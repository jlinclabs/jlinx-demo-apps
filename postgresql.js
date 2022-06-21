const knexfile = require('./knexfile.js')
const knex = require('knex')(knexfile)
knex.ready = async function(){
  return await knex.raw('SELECT 1')
}
module.exports = knex
