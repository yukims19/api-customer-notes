require("dotenv").load();
const express = require("express");
//const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 5000;
const escape = require("pg-escape");
const fetch = require("node-fetch");
const connectionString = process.env.DATABASE_URL;
const { Client } = require("pg");
const client = new Client({ connectionString: connectionString });
client.connect();

app.get("/customers", (req, res) => {
  var sql = "SELECT * FROM customers";
  let resData;
  client.query(sql, (error, response) => {
    resData = response.rows;
    res.send(resData);
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
