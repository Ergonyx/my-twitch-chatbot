// Require node modules
// Make variables inside .env element available to project
require("dotenv").config();
// Grab the MySQL stuff so I can do database things.
const sql = require("mysql");
// Pull in express and CORS for API calls.
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const dbService = require('./dbService')

// These seemto just appear. Honestly not sure wtf is going on here.
const { raw } = require("tmi.js/lib/commands");
const { response } = require("express");

app.listen(process.env.EXPRESS_PORT, () => {
    console.log(`App listening on port 5000`)
})

// All the Database things.
// FIXME: These endpoints are terrible and could be much better organized.
// CREATE
app.post('/insert', (req, res) => {
    
})
app.post('/addNewUser/:username', (req, res) => {
    console.log("Creating new user...")
    const db = dbService.getDbServiceInstance();
    const result = db.addNewUser(req.params.username)
    result
    .then(data => {
        res.send(data)
    })
    .catch(err => console.log(err))
})

// READ
app.get('/getAll', (req, res) => {
    const db = dbService.getDbServiceInstance();
    const result = db.getAllData()
    result
    .then(data => {
        res.send(data)
    })
    .catch(err => console.log(err))
})
app.get('/getTop10', (req, res) => {
    const db = dbService.getDbServiceInstance();
    const result = db.getTop10()
    result
    .then(data => {
        res.send(data)
    })
    .catch(err => console.log(err))
})
app.get('/getMyPoints/:username', (req, res) => {
    const db = dbService.getDbServiceInstance();
    const result = db.getMyPoints(req.params.username)
    result
    .then(data => {
        res.send(data)
    })
    .catch(err => console.log(err))
})
// UPDATE
app.patch('/v1/points/add/:username', (req, res) => {
    console.log(`Increasing points for ${req.params.username}.`)
    const db = dbService.getDbServiceInstance();
    const result = db.addPoints(req.params.username)
    result
    .then(data => {
        res.send(data)
    })
    .catch(err => console.log(err))
})
// DELETE

