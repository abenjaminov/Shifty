import * as express from 'express';
import { Router } from 'express';
import { RoutesCommon } from './routeCommon';
import { Profile, Absence } from '../models/models';
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
    // TODO : Log Error
  });
});

router.put('/', async (req , res) => {
  var profile = req.body;
  
  // TODO : Fix dates for absences

  var context = RoutesCommon.getContextFromRequest(req);
  context.connection.beginTransaction();

  try {
    await context.update(Profile, profile);
    await context.updateOneToManyMappings(Profile, profile);
    await context.insert(Absence, profile.absences);

    context.connection.commit();

    res.json({data : profile});
  } catch (error) {
    console.error("Put Profile " + error);
    context.connection.rollback();
    res.status(500).send();
  }
})

module.exports = router;
