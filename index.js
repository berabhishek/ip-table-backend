var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
// var cookieParser = require('cookieparser');
var app = express();

// app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());

//Require the Router we defined in movies.js
var ipdata = require('./ipdata.js');
var formhelper = require('./formhelper.js')
//Use the Router on the sub route /movies
app.use('/ipdata', ipdata);
app.use('/formhelper', formhelper);
app.listen(27017);
