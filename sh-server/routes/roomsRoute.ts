import { Room } from "../models/models";
import { Router } from "express-serve-static-core";

var express = require('express');
var router: Router = express.Router();

var roomId = 0;

var rooms : Room[] =  [{ id:roomId++, name: "Senior", conditions: [] },
  { id:roomId++, name: "Conventional", conditions: [] },
  { id:roomId++, name: "RF", conditions: [] },
  { id:roomId++, name: "CT Protocoling", conditions: [] },
  { id:roomId++, name: "CT ER", conditions: [] },
  { id:roomId++, name: "Chest", conditions: [] },
  { id:roomId++, name: "Neuroradiology", conditions: [] },
  { id:roomId++, name: "US", conditions: [] },
  { id:roomId++, name: "MRI", conditions: [] },
  { id:roomId++, name: "Pediatrics", conditions: [] },
  { id:roomId++, name: "MSK", conditions: [] },
  { id:roomId++, name: "Breast", conditions: [] },
  { id:roomId++, name: "Angio", conditions: [] },
  { id:roomId++, name: "Intern", conditions: [] }];

router.get('/', function(req, res, next) {
  res.json({data : rooms});
});

router.put('/', (req,res,next) => {
    var room = req.body;
    
    var oldRoomIndex = rooms.findIndex(x => x.id == room.id);
  
    if(oldRoomIndex > -1) {
        rooms[oldRoomIndex] = room;
    }
  
    res.json({data : room});
  })

module.exports = router;