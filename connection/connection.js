const { Pool, Client } = require('pg');

const pool = new Pool({

    user: 'user1',
    host: '127.0.0.1',
    database: 'apnaghar',
    password: 'test123',
    port: 5432,
})


const client = new Client({

    user: 'user1',
    host: '127.0.0.1',
    database: 'apnaghar',
    password: 'test123',
    port: 5432,
})
client.connect().then(() => console.log("connected"));


module.exports = client;





