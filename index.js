const express = require("express");
const CORS = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
    console.log(`The api server is running at: http://localhost:${PORT}`);
});