require("dotenv").load();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
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

app.get("/customers/:id", (req, res) => {
  const sql = escape("SELECT * FROM customers WHERE id=%L", req.params.id);
  let resData;
  client.query(sql, (error, response) => {
    resData = response.rows;
    res.send(resData);
  });
});

app.post("/save/:field", (req, res) => {
  const field = req.params.field;
  const fieldValue = req.body[field];
  const customerId = req.body.id;
  const sql = escape(
    "UPDATE customers SET %s=%L WHERE id=%L;",
    field,
    fieldValue,
    customerId.toString()
  );
  client.query(sql, (error, response) => {
    console.log(error, response);
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
