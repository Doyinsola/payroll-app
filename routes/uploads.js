const router = require("express").Router();
const uploadsController = require("../controllers/upload-controllers");
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router
    .route("/")
    .post(upload.single('file'), uploadsController.handleUploads)

module.exports = router;