const pg = require('pg');

const pool = new pg.Pool({
    host: 'localhost',
    port: 5432,
    database: 'socialmedia',
    user: 'postgres',
    password: "San123"
});

pool.query(
    `
    UPDATE posts
    SET loc = POINT(lng, lat)
    WHERE loc is NULL;
`
    )
    .then(() => {
        console.log('Update Complete');
        pool.end();
    })
    .catch((err) => console.error(err.message));
