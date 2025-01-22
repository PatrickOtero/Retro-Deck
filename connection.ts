import knex from 'knex';
import knexConfig from "./knexfile"

const knexInstance = knex(knexConfig);

export default knexInstance;