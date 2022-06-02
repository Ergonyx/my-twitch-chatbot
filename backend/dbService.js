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
            console.log("Getting ALL data.")
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
    async getUserPoints(username) {
        try {
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
                return `Error: User ${username} already exists.  No action taken.`
            } else {
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
    // NOTE: Based on my reading about doing multi-row statements and the benchmarks I've seen I've decided that this will likely send up to 50 rows (max) at a time as that achieves similar numbers to doing 10000 at a time.
    async batchTest(list) {
        try {
            if (list.length === 0) {
                console.log("Received nothing so doing nothing.")
                return; // If it received nothing, do nothing.  Should probably just have the other thing not send anything...
            } 
            // scope variables
            let updateTheseQuery = []
            let insertTheseQuery = []

            for (let i = 0; i < list.length; i++) {
                const el = list[i];
                const response = await new Promise((resolve, reject) => {
                    const query = `SELECT * FROM users WHERE name = "${el}"`
                    connection.query(query, (err, results) => {
                        if (err) reject(new Error(err.message))
                        resolve(results)
                    })
                })
                if (response.length > 0) {
                    // updateTheseQuery += `UPDATE users SET points = points + 10 WHERE name = "${el}"\n`
                    // TODO: In these array pushes I can push the username to a cached array so as to avoid searching for the same user every time.
                    updateTheseQuery.push(response[0]['id'])
                }
                if (response.length === 0) {
                    insertTheseQuery.push(`("${el}", 10)`)
                }
            }
            
            // TODO: Limit these to 50 elements per query... at some point.
            if (insertTheseQuery.length === 0) {
                console.log(`No new users.`)
            } else {
                // Insert all new users.
                const response = await new Promise((resolve, reject) => {
                    const query = `INSERT INTO users (name, points)\nVALUES\n${insertTheseQuery.join(',\n')};`
                    connection.query(query, (err, results) => {
                        if (err) reject(new Error(err.message))
                        resolve(results)
                    })
                })
            }
            
            if (updateTheseQuery.length === 0) {
                console.log(`No users to update.`)
            } else {
                // Update all existing users.
                const response = await new Promise((resolve, reject) => {
                    const query = `UPDATE users SET points = points + 10 WHERE id IN (${updateTheseQuery.join(', ')})`
                    connection.query(query, (err, results) => {
                        if (err) reject(new Error(err.message))
                        resolve(results)
                    })
                })
                // console.log(`UPDATE users SET points = points + 10 WHERE id IN (${updateTheseQuery.join(', ')})`)
            }
            console.log(`Added 10 points to ${updateTheseQuery.length} users and created ${insertTheseQuery.length} new users`);
            
        } catch (err) {console.log(err)}
    }
}

module.exports = DbService;