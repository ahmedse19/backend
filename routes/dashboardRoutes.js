const express = require("express");
const router = express.Router();

const {
  getdashboardData,
  getEmployeedata,
} = require("../controllers/controllers.js");

router.route("/").get(getdashboardData);
router.route("/employe").get(getEmployeedata);

module.exports = router;
