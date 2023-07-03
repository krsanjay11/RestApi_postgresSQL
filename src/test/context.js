const { randomBytes } = require('crypto');
const { default: migrate } = require('node-pg-migrate');
const format = require('pg-format');
const pool = require('../pool');

const DEFAULT_DBCONNECT = {
    host: 'localhost',
    port: 5432,
    database: 'socialmedia-test',
    user: 'postgres',
    password: 'San123'
}

class Context{
    static async build(){
        // Randomly generating a role name to connect to pg as 
        const roleName = 'a' + randomBytes(4).toString('hex');

        // connect to pg as usual
        await pool.connect(DEFAULT_DBCONNECT);

        // create a new role
        // CREATE ROLE ${roleName} WITH LOGIN PASSWORD '${roleName}';
        // %I - identifier, %L - litteral value
        await pool.query(format(
            'CREATE ROLE %I WITH LOGIN PASSWORD %L;', roleName, roleName
        ));

        // create a schema with the same name 
        await pool.query(format(
            'CREATE SCHEMA %I AUTHORIZATION %I;', roleName, roleName
        ));

        // disconnect entirely from pg
        await pool.close();

        // run our migrations in the new schema
        await migrate({
            schema: roleName,
            direction: 'up',
            log: () => {},
            noLock: true,
            dir: 'migrations',
            databaseUrl: {
                host: 'localhost',
                port: 5432,
                database: 'socialmedia-test',
                user: roleName,
                password: roleName
            }
        });

        // connect to pg as the newly created role
        await pool.connect({
            host: 'localhost',
            port: 5432,
            database: 'socialmedia-test',
            user: roleName,
            password: roleName
        });

        return new Context(roleName);
    }

    constructor(roleName){
        this.roleName = roleName;
    }

    async reset(){
        return pool.query('DELETE FROM users;');
    }

    async close(){
        // disconnect from pg
        await pool.close();

        // reconnect as out root user
        await pool.connect(DEFAULT_DBCONNECT);

        // delete the role and schema we created
        await pool.query(
            format('DROP SCHEMA %I CASCADE;', this.roleName)
        )
        await pool.query(
            format('DROP ROLE %I;', this.roleName)
        )
        // disconnect 
        await pool.close();
    }
}

module.exports = Context;