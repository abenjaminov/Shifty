import { RoutesCommon, HttpResponseCodes } from './routeCommon';
import { Profile, Absence, NonWorkingDay } from '../models/models';
import { IFilterStatement } from '../database/database';
import { toUtcDate, getHttpResposeJson } from '../models/helpers';
import { Router } from "express-serve-static-core";

import * as express from 'express';
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
    res.json(getHttpResposeJson(profiles, false));
  }).catch(err => {
    req.logService.error("Error getting profiles", err);
    res.status(HttpResponseCodes.internalServerError).send().end();
  });
});

router.put('/', async (req , res) => {
  var profile = req.body;

  fixProfileBeforeSave(profile);

  var context = RoutesCommon.getContextFromRequest(req);
  context.connection.beginTransaction();

  try {
    await context.update(Profile, profile, true);
    await context.updateOneToManyMappings(Profile, profile);
    
    await context.deleteConnections(Absence, "profileId", profile.id,profile.absences.filter(x => x.id).map(x => x.id));
    await context.updateOrInsert(Absence, profile.absences);

    await context.deleteConnections(NonWorkingDay, "profileId", profile.id, profile.nonWorkingDays.filter(x => x.id).map(x => x.id));
    await context.updateOrInsert(NonWorkingDay, profile.nonWorkingDays);

    context.connection.commit();

    req.cacheService.clearByPrefix('/api/profiles');

    res.json(getHttpResposeJson(profile, true));
  } catch (error) {
    req.logService.error("Error puting profile", error)
    context.connection.rollback();
    res.status(HttpResponseCodes.internalServerError).send().end();
  }
})

function fixProfileBeforeSave(profile: any) {
  if(profile.absences && profile.absences.length > 0) {
    for(let absence of profile.absences) {
      let startDate = new Date(absence.startDate);
      let endDate = new Date(absence.endDate);

      absence.startDate = toUtcDate(startDate);
      absence.endDate = toUtcDate(endDate);
    }
  }
}

export default router;
