const fs = require('fs/promises')

exports.up = async function(knex) {
  await knex.schema.createTable('users', function (table) {
    table.increments('id').primary()
    table.string('username')
    table.string('jlinx_app_user_id')
    table.timestamps()
  })

  // CREATE TABLE "session"
  const sql = await fs.readFile(require.resolve('connect-pg-simple/table.sql'))
  await knex.schema.raw(`${sql}`)
}

exports.down = async function(knex) {
  await knex.schema.dropTable('session')
  await knex.schema.dropTable('users')
}
