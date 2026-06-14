const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded());
app.use(express.static("www",
    { "index": "index.html" })
);

app.listen(8081, function () {
    console.log("Server running at http://localhost:8081");
});