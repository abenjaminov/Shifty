import { Tag } from "../models/models";
import { Router } from "express-serve-static-core";

var express = require('express');
var router : Router = express.Router();

var tagId = 0;

var tags: Tag[] =  [];

router.get('/', function(req, res, next) {
  res.json({data : tags});
});

module.exports = router;
