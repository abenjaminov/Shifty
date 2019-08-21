"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = __importStar(require("express"));
var configurations_1 = require("../database/configurations");
var router = express.Router();
/* GET users listing. */
router.get('/', function (req, res) {
    req.dbContext.select("Zedek", configurations_1.ShConfig.Profiles.selectAllQuery).then(function (profiles) {
        res.json({ data: profiles });
    });
});
router.put('/', function (req, res) {
    var profile = req.body;
    // var oldProfileIndex = profiles.findIndex(x => x.id == profile.id);
    // if(oldProfileIndex > -1) {
    //   profiles[oldProfileIndex] = profile;
    // }
    res.json({ data: profile });
});
module.exports = router;
//# sourceMappingURL=profilesRoute.js.map