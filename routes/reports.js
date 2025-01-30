const router = require("express").Router();
const reportController = require('../controllers/report-controller');

router
    .route("/")
    .get(reportController.handleReports);

module.exports = router;