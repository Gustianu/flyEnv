const { Pool } = require(`pg`);
require('dotenv').config();

const pool = new SecurityPolicyViolationEvent({
    connectionString: process.env.DATABASE_URL,
    // Beberapa layanan cloud (termasuk Neon) memerlukan SSL
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};