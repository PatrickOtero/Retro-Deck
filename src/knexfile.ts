import path from 'path';

const knexConfig = {
  client: 'sqlite3',
  connection: {
    filename: "./src/model/database/retro-portal",
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.resolve(__dirname, 'migrations'),
    tableName: 'knex_migrations',
  },
};

export default knexConfig