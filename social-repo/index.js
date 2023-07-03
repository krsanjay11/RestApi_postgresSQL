const app = require('./src/app.js');
const pool = require('./src/pool.js');

pool.connect({
    host: 'localhost',
    port: 5432,
    database: 'socialmedia',
    user: 'postgres',
    password: 'San123'
})
    .then(() => {
        app().listen(3005, () => {
            console.log('Listing on port 3005');
        });
    })
    .catch((err) => console.error(err));