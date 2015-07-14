var express = require('express');
var router = express.Router();
var request = require('request');
var url = 'http://www.divvybikes.com/stations/json';

/* GET home page. */
router.get('/', function(req, res, next) {
  request(url, function(error, response, body) {
    res.render('index', { title: 'Divvy Bike Map', divvyData: body });});
});

module.exports = router;
