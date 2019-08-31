import * as express from 'express';
import { Router } from 'express';
import { RoutesCommon } from './routeCommon';
import { Profile } from '../models/models';
import { IFilterStatement } from '../database/database';

var router: Router = express.Router(); 

/* GET users listing. */
router.get('/:id?', (req , res) => {
  var context = RoutesCommon.getContextFromRequest(req);
  
  var filter: IFilterStatement[] = [{ dataFilters: [] }];
  if(req.params.id) {
    filter[0].dataFilters.push({ 
      property: "id",
      value: req.params.id
    })
  }

  context.select(Profile, true,true, filter).then(profiles => {
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
    context.updateOneToManyMappings(Profile, profile).then(x => {
      context.connection.commit();
      res.json({data : profile});
    })
  }).catch(err => {
    console.error("Put Profile " + err);
    context.connection.rollback();
  });
})

module.exports = router;
