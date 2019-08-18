var express = require('express');
var router = express.Router();

var profiles = [];
var profileId = 0;

profiles.push({id: (profileId++).toString(), name: 'בנימינוב',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'ברלוביץ',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'בוגאט',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'שינקמן',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'כאלותי',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'פרידמן',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'פראנק',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'פינקלשטיין',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'ברנס',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'הדס',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'ציטר',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'זארקוב',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'בן דויד',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'זגל',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'ברקוביץ',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'אקרמן',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'סטראנו',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'נקיטין',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'גכטמן',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'פרשטנדיג',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'קניזניק',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'פרקש',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'אפלבוים',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'פרנקל',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'אלפרסון',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'פיצחדזדה',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'ויינברג',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'שחנובסקי',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'יופייטה',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'אלטורה',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'מהאני',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'שאהין',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'צאלחי',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'זיד',professions:[],profilePic: ''});
profiles.push({id: (profileId++).toString(), name: 'נאגאר',professions:[],profilePic: ''});

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
