import * as express from 'express';
import { Router } from 'express';
import { RoutesCommon } from './routeCommon';
import { Profile } from '../models/models';

var router: Router = express.Router(); 

/* GET users listing. */
router.get('/', (req , res) => {
  var context = RoutesCommon.getContextFromRequest(req);
  
  context.select(Profile, true).then(profiles => {
    res.json({data : profiles});
  }).catch(err => {
    console.error("Put Profile " + err);
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
  }).catch(err => {
    console.error("Put Profile " + err);
    context.connection.rollback();
  });
})

module.exports = router;
