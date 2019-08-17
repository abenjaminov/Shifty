var express = require('express');
var router = express.Router();

var tags =  [{ id:0, name: "Senior" },{ id:1, name: "Intern" },{ id:2, name: "Senior - Kids" }];

router.get('/', function(req, res, next) {
  res.json({data : tags});
});

module.exports = router;
