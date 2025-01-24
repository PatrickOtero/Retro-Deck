import Knex from 'knex';
import knexConfig from './knexfile';

const knexInstance = Knex(knexConfig);

knexInstance
  .raw('SELECT 1+1 AS result')
  .then(() => console.log('Banco de dados conectado e funcionando!'))
  .catch((err) => console.error('Erro ao conectar ao banco de dados:', err.message));

knexInstance('emulators')
  .select('*')
  .then((result) => {
    console.log('Tabelas emuladores:', result);
  })
  .catch((err) => {
    console.error('Erro ao consultar a tabela emuladores:', err.message);
  });

export default knexInstance;