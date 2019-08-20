import * as express from 'express';
import { Router } from "express-serve-static-core";
import { DbContext } from "../database/database";
import { ShConfig } from '../database/configurations';

var router: Router = express.Router();

/* GET users listing. */
router.get('/', (req , res) => {
  (req["dbContext"] as DbContext).select("Zedek", ShConfig.Profiles.selectAllQuery).then(profiles => {
    res.json({data : profiles});
  });
});

router.put('/', (req , res) => {
  var profile = req.body;

  // var oldProfileIndex = profiles.findIndex(x => x.id == profile.id);

  // if(oldProfileIndex > -1) {
  //   profiles[oldProfileIndex] = profile;
  // }

  res.json({data : profile});
})

module.exports = router;
