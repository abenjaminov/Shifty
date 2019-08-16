var express = require('express');
var router = express.Router();

var profiles = [];

profiles.push({ id:'0', name: "Asaf Benjaminov",professions:[{ id:0, name: "Senior" },{ id:1, name: "Intern" }] })
profiles.push({ id:'1' , name: "Israel israeli",professions:[{ id:1, name: "Intern" }] });

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json({data : profiles});
});

router.put('/', (req,res,next) => {
  var profile = req.body;
  
  var oldProfileIndex = profiles.findIndex(x => x.id == profile.id);

  if(oldProfileIndex > -1) {
    profiles[oldProfileIndex] = profile;
  }

  res.json({data : profile});
})

module.exports = router;
