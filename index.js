const knex = require("knex")(require("./knexfile"));
const express = require("express");
const CORS = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8081;

app.use(express.json());
app.use(CORS());

const uploadsRoutes = require('./routes/uploads')
app.use('/uploads', uploadsRoutes)

const reportsRoutes = require('./routes/reports')
app.use('/reports', reportsRoutes)

app.listen(PORT, () => {
    console.log(`The api server is running at: http://localhost:${PORT}`);
});