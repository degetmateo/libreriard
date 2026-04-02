const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URI,
    ssl: {
        rejectUnauthorized: true,
        ca: Buffer.from(process.env.DATABASE_CA, 'base64').toString()
    }
});

module.exports = pool;