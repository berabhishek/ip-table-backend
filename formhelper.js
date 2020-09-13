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

//thiss is updated comment
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

router.get("/connectiontype", cors(), (req, res) => {
    connection.query(`select * from connectiontype`, (err, rows, callback) => {
        let connectiontype = rows.map(row => {
            return row['connectiontype'];
        });
        res.json({
            "connectiontype": connectiontype
        });
    });
});

router.get("/device/:device/:connectiontype", cors() , (req, res) => {
    connection.query(`select name from ${req.params.device} where connectiontype in ('${req.params.connectiontype}')`, (err, rows, callback) => {
        let devices = [];
        if(rows){
            devices = rows.map(row => {
                return row['name'];
            });
        }
            res.json({
            "name": devices
        });
    });
});

router.get("/vrfname", cors(), (req, res) => {
    connection.query(`select vrfname from projectref`, (err, rows, callback) => {
        let vrfname = rows.map(row => {
            return row['vrfname'];
        });
        res.json({
            "vrfname": vrfname
        });
    });
});

module.exports = router;