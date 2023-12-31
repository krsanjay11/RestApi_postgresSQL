const express = require('express');
const pg = require('pg');

const pool = new pg.Pool({
    host: 'localhost',
    port: 5432,
    database: 'socialmedia',
    user: 'postgres',
    password: "San123"
});

// pool.query('SELECT 1+1;').then((res) => console.log(res)); -- test the connection

const app = express(); //creating exprss app
app.use(express.urlencoded({extended: true}));  // middleware to use with express app 

app.get('/posts', async(req, res) => {
    const { rows } = await pool.query(`
        SELECT * FROM posts;
    `);

    // console.log(rows);

    res.send(`
        <table> 
            <thead>
                <tr>
                    <th>id</th>
                    <th>lng</th>
                    <th>lat</th>
                </tr>
            </thead>
            <tbody>
                ${rows.map(row => {
                    return `
                        <tr>
                            <td>${row.id}</td>
                            <td>${row.loc.x}</td>
                            <td>${row.loc.y}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
        <form method="POST">
            <h3> Create post</h3>
            <div>
                <label>Lng</label>
                <input name="lng" />
            </div>
            <div>
                <label>Lat</label>
                <input name="lat" />
            </div>
            <button type="submit">Create</button>
        </form>
    `);
});    // route handlers

app.post('/posts', async(req, res) => {
    const { lng, lat } = req.body;
    // await pool.query('INSERT INTO posts (lat, lng, loc) VALUES ($1, $2, $3);', 
    // [lat, lng, `(${lng},${lat})`]
    await pool.query('INSERT INTO posts (loc) VALUES ($1);', 
    [`(${lng},${lat})`]
    )
    res.redirect('/posts');
});

app.listen(3005, () => {
    console.log('Listening on port 3005');
});