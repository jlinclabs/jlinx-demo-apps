exports.up = function(knex) {
  knex.schema.createTable('users', function (table) {
    table.increments().primary()
    table.string('username').unique().notNullable()
    table.string('jlinx_account_id')
    table.timestamps()
  })
  knex.schema.createTable('tweets', function (table) {
    table.increments().primary()
    table.string('username').notNullable().references('users.username')
    table.string('content')
    table.timestamps()
  })
}

exports.down = function(knex) {
  knex.schema.dropTable('tweets')
  knex.schema.dropTable('users')
}
