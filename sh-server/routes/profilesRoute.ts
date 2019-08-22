import * as express from 'express';
import { ShConfig } from '../database/configurations';
import { Router } from 'express';
import { RoutesCommon } from './routeCommon';
import { Profile } from '../models/models';

var router: Router = express.Router(); 

var ProfilesConfig = ShConfig.Profiles;

/* GET users listing. */
router.get('/', (req , res) => {
  var context = RoutesCommon.getContextFromRequest(req);
  
  context.select(Profile, true).then(profiles => {
    res.json({data : profiles});
  });
});

router.put('/', (req , res) => {
  var profile = req.body;
  var context = RoutesCommon.getContextFromRequest(req);
  context.connection.beginTransaction();

  context.update(Profile, profile).then(x => {
    context.updateComplexMappings(Profile, profile).then(x => {
      context.connection.commit();
      res.json({data : profile});
    })
  });
})

module.exports = router;
