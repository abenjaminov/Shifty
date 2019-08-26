import { Tag } from "../models/models";
import { Router } from "express-serve-static-core";

var express = require('express');
var router : Router = express.Router();

var tagId = 0;

var tags: Tag[] =  [{ id:tagId++, name: "Senior" },
  { id:tagId++, name: "Conventional" },
  { id:tagId++, name: "RF" },
  { id:tagId++, name: "CT Protocoling" },
  { id:tagId++, name: "CT ER" },
  { id:tagId++, name: "Chest" },
  { id:tagId++, name: "Neuroradiology" },
  { id:tagId++, name: "US" },
  { id:tagId++, name: "MRI" },
  { id:tagId++, name: "Pediatrics" },
  { id:tagId++, name: "MSK" },
  { id:tagId++, name: "Breast" },
  { id:tagId++, name: "Angio" },
  { id:tagId++, name: "Intern" }];

router.get('/', function(req, res, next) {
  res.json({data : tags});
});

module.exports = router;