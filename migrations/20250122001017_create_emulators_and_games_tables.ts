import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('emulators', (table) => {
    table.uuid('id').primary(); 
    table.string('emulatorName').notNullable().unique(); 
    table.specificType('romExtensions', 'text[]').defaultTo('{}'); 
    table.timestamps(true, true); 
  });

  await knex.schema.createTable('games', (table) => {
    table.uuid('id').primary(); 
    table.string('gameName').notNullable().unique(); 
    table.text('description').nullable(); 
    table.string('backgroundImage').nullable(); 
    table.string('fileName').nullable().unique(); 
    table.uuid('emulator_id').nullable().references('id').inTable('emulators').onDelete('SET NULL'); 
    table.timestamps(true, true); 
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('games');
  await knex.schema.dropTableIfExists('emulators');
}