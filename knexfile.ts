import path from 'path';

export default {
  client: 'sqlite3',
  connection: {
    filename: path.join(process.cwd(), 'src', 'model', 'database', 'retro-portal-local-database.sqlite'),
  },
  migrations: {
    directory: path.resolve(__dirname, 'migrations'),
    tableName: 'knex_migrations',
  },
};