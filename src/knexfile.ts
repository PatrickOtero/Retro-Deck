import path from 'path';
import { app } from 'electron';

const knexConfig = {
  client: 'sqlite3',
  connection: {
    filename: app.isPackaged 
    ? path.join(process.resourcesPath, 'database', 'retro-portal')
    : path.join(__dirname, 'model', 'database', 'retro-portal'),
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.resolve(__dirname, 'migrations'),
    tableName: 'knex_migrations',
  },
};

export default knexConfig