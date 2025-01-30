const knex = require("knex")(require("./knexfile"));
const express = require("express");
const multer = require('multer');
const CORS = require("cors");
const path = require('path');
const fs = require('fs');
const Papa = require('papaparse');
const { fileURLToPath } = require("url");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8081;

app.use(express.json());
app.use(CORS());

const uploadsRoutes = require('./routes/uploads')
app.use('/uploads', uploadsRoutes)

// app.post('/uploads', upload.single('file'), async (req, res) => {

//     const file = req.file;
//     const filePath = req.file.path;
//     const fileName = file.originalname;
//     const reportID = parseInt(fileName.split('-')[2].split('.')[0]);

//     if (!file) {
//         return res.status(400).send('No file uploaded.');
//     }

//     try {

//         const reportExists = await knex('time_reports').where('id', reportID).first();

//         if (reportExists) {
//             fs.unlink(filePath, (err) => {
//                 if (err) {
//                     console.error("Error deleting file:", err);
//                 } else {
//                     console.log("File deleted successfully.");
//                 }
//             });

//             res.status(400).send("Report with this ID alread exists")
//         }
//         else {
//             await knex('time_reports')
//                 .insert({
//                     id: reportID,
//                     report_name: fileName,
//                     uploaded_at: knex.fn.now(),
//                 })

//             let payrollData = [];

//             const fileContent = fs.createReadStream(filePath)
//             Papa.parse(fileContent, {
//                 header: true,
//                 step: (results) => {
//                     payrollData.push(results.data)
//                     console.log(payrollData)
//                 },
//                 complete: () => {
//                     res.json(payrollData);
//                 }
//             })
//         }

//         //res.send(`File uploaded successfully: ${req.file.filename}`)

//     } catch (error) {
//         console.log(error);
//         return res.status(500).send('Issue uploading file');
//     }

// })


app.listen(PORT, () => {
    console.log(`The api server is running at: http://localhost:${PORT}`);
});