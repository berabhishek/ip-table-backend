var express = require('express');
var router = express.Router();
var cors = require('cors');

var mysql = require('mysql')
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'abhishek',
  password: 'Abhishek123',
  database: 'my_db'
})

router.get("/state/:country", cors(), (req, res) => {
    connection.query(`select distinct state from offices where country in ('${req.params.country}')`, (err, rows, fields) => {
        let states = []
        states = rows.map(row => {
            return row['state'];
        });
        res.json({
            "state": states
        });
    });
});

router.get("/office/:state", cors(), (req, res) => {
    connection.query(`select distinct office from offices where state in ('${req.params.state}')`, (err, rows, fields) => {
        let offices = rows.map(row => {
            return row['office'];
        });
        res.json({
            "office": offices
        });
    });
});

module.exports = router;