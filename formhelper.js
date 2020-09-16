var express = require('express');
var router = express.Router();
var cors = require('cors');
var asyncloop = require('async');

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
var mysql = require('mysql');
const e = require('express');
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

router.get("/validate/:projectname/:projectid/:vrfname", cors(), (req, res) => {
    connection.query(`select * from projectref where projectname in ('${req.params.projectname}') and projectid in ('${req.params.projectid}') and vrfname in ('${req.params.vrfname}')`, (err, rows, callback) => {
        let resp = false;
        if(rows && rows.length !== 0) {
            resp = true;
        }
        res.json({
            "valid": resp
        });
    });
});

router.get("/validateany/:projectname/:projectid/:vrfname", cors(), (req, res) => {
    connection.query(`select * from projectref where projectname in ('${req.params.projectname}') or projectid in ('${req.params.projectid}') or vrfname in ('${req.params.vrfname}')`, (err, rows, callback) => {
        let resp = true;
        if(rows && rows.length !== 0) {
            resp = false;
        }
        res.json({
            "valid": resp
        });
    });
});
//get form data
router.post("/setipdata/:existing", cors(), (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //first submit the connect
    var connectids = [];
    let ids = [
        [
            "device1_1",
            "device2_1",
            "vlan_1",
            "subnet_1",
            "entervalue_1"
        ],
        [
            "device1_2",
            "device2_2",
            "vlan_2",
            "subnet_2",
            "entervalue_2"
        ],
        [
            "device1_3",
            "device2_3",
            "vlan_3",
            "subnet_3",
            "entervalue_3"
        ],
        [
            "device1_4",
            "device2_4",
            "vlan_4",
            "subnet_4",
            "entervalue_4"
        ]
    ];
    asyncloop.each(ids, function(id, callback) {
        let data = [];
        id.forEach(dataid => {
            data.push(req.body[dataid] ? req.body[dataid] : '');
        });
        connection.query(`insert into connect (device1, device2, vlan, subnet, entervalue) values ('${data[0]}', '${data[1]}', '${data[2]}', '${data[3]}', '${data[4]}')`, (err, result) => {
            connectids.push(result.insertId);
            callback(err);
        })
    }, function(err) {
        if(err) {
            console.error(err);
        } else {
            //all good insert data
            let query_st = `select * from projectref where projectname in ('${req.body.projectname}') and projectid in ('${req.body.projectid}') and vrfname in ('${req.body.vrfname}')`;
            if(req.params.existing === "new") {
                query_st = `insert into projectref (projectname, projectid, vrfname) values ('${req.body.projectname}', '${req.body.projectid}', '${req.body.vrfname}')`; 
            }
            connection.query(query_st, (err, rows, fields) => {
                var projid = null;
                if(req.params.existing === "new") {
                    projid = rows.insertId;
                } else {
                    projid = rows[0].id;
                }
                connection.query(`insert into iptable (region, country, city, facility, connectivitytype, projectid, connect1, connect2, connect3, connect4) values ('${req.body.region}', '${req.body.country}', '${req.body.city}', '${req.body.facility}', '${req.body.connectivitytype}', ${projid}, ${connectids[0]}, ${connectids[1]}, ${connectids[2]}, ${connectids[3]})`, (err, result) => {
                    console.error(err);
                    res.json({
                        "id": result.insertId
                    });
                });
            });
        }
    });
});

router.get("/alldata/:id", cors(), (req, res) => {
    connection.query(`select * from iptable where id in ('${req.params.id}')`, (err, rows, fields) => {
        if(rows.length === 0) {
            return res.json({
                "data": []
            });
        } else {
            let data = rows[0];
            connection.query(`select * from projectref where id in ('${data.projectid}')`, (err, rows, fields) => {
                data.projectname = rows[0].projectname;
                data.projectid = rows[0].projectid;
                data.vrfname = rows[0].vrfname;
                data.asnumber = rows[0].asnumber;
                connection.query(`select * from connect where id in (${data.connect1}, ${data.connect2}, ${data.connect3}, ${data.connect4})`, (err, rows, fields) => {
                    rows.forEach((row, iterator) => {
                        data[`connect${iterator+1}data`] = {
                            "device1": row.device1,
                            "device2": row.device2,
                            "vlan": row.vlan,
                            "subnet": row.subnet,
                            "entervalue": row.entervalue
                        }
                    });
                    res.json({
                        data: data
                    })
                });
            });
        }
    });
});
module.exports = router;