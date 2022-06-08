exports.up = async function(knex) {
  await knex.schema.createTable('users', function (table) {
    table.increments('id').primary()
    table.string('username')
    table.string('jlinx_app_account_id')
    table.timestamps()
  })
  await knex.schema.createTable('tweets', function (table) {
    table.increments().primary()
    table.integer('user_id').notNullable().references('users.id')
    table.string('content')
    table.timestamps()
  })
}

exports.down = async function(knex) {
  await knex.schema.dropTable('tweets')
  await knex.schema.dropTable('users')
}
