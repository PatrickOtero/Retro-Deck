import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('emulators', (table) => {
    table.string('id').primary();
    table.string('emulatorName').notNullable().unique();
    table.text('romExtensions').defaultTo('[]'); 
    table.timestamp('createdAt').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('games', (table) => {
    table.string('id').primary();
    table.string('gameName').notNullable().unique();
    table.text('description').nullable();
    table.string('backgroundImage').nullable();
    table.string('fileName').nullable().unique();
    table
      .uuid('emulator_id')
      .nullable()
      .references('id')
      .inTable('emulators')
      .onDelete('SET NULL');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('games');
  await knex.schema.dropTableIfExists('emulators');
}
