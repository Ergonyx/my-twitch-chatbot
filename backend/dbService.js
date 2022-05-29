const mysql = require('mysql');
require('dotenv').config()

let instance = null

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if (err) {
        console.log(err.message)
    }
    console.log(`DB ${connection.state}`)
})

class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService()
    }
    async getAllData() {
        try {
            console.log("Attempting to query database.")
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM users;"
                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message))
                    resolve(results)
                })
            })
            // console.log(response)
            return response;
        } catch (err) {
            console.log(err)
        }
    }
    async getTop10() {
        try {
            console.log("Retrieving Top 10.")
            const response = await new Promise((resolve, reject) => {
                const query = "SELECT * FROM users ORDER BY points DESC LIMIT 10;"
                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message))
                    resolve(results)
                })
            })
            return response;
        } catch (err) {
            console.log(err)
        }
    }
    async getMyPoints(username) {
        try {
            console.log(`Retreiving points for: ${username}`)
            const response = await new Promise((resolve, reject) => {
                const query = `SELECT * FROM users WHERE name = '${username}';`
                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message))
                    resolve(results)
                })
            })
            return response;
        } catch (err) {
            console.log(err)
        }
    }
    async addNewUser(username) {
        try {
            // Query the DB to see if the username already exists.
            const alreadyExists = await new Promise ((resolve, reject) => {
                const query = `SELECT * FROM users WHERE name = "${username}"`
                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message))
                    resolve(results)
                })
            })
            // If it exists then it does nothing and returns an error.  Otherwise it creates the new user.
            if (alreadyExists.length > 0) {
                console.log(`Error: User ${username} already exists.  No action taken.`)
                return `Error: User ${username} already exists.  No action taken.`
            } else {
                console.log(`${username} not found.  Creating entry.`)
                const response = await new Promise((resolve, reject) => {
                    const query = `
                            INSERT INTO users(name,points)
                            VALUES('${username}', 10);
                        `
                        connection.query(query, (err, results) => {
                            if (err) reject(new Error(err.message))
                            resolve(results)
                        })
                    })
                return response;
            }
        } catch (err) {console.log(err)}
    }
    async addPoints(username) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = `
                    UPDATE users SET points = points + 10 WHERE name = "${username}";
                `
                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message))
                    resolve(results)
                })
            })
            return response;
        } catch (err) {console.log(err)}
    }
}

module.exports = DbService;