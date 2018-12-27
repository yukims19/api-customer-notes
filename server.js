//require("dotenv").load();
const express = require("express");
const path = require("path");
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
const aesjs = require("aes-js");
const aes_key = process.env.AES_KEY.split(", ").map(Number);
const session = require("express-session");

app.use(express.static(path.resolve(__dirname, "./client/build")));

app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    store: new (require("connect-pg-simple")(session))(),
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { path: "/", httpOnly: true, secure: false, maxAge: null },
    isLoggedin: false
  })
);

app.get("/checkLogin", (req, res) => {
  const sessionId = req.session.id;
  res.send({ isLoggedin: req.session.isLoggedin });
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const usernameBytes = aesjs.utils.utf8.toBytes(username);
  const aesCtr = new aesjs.ModeOfOperation.ctr(aes_key, new aesjs.Counter());
  const encryptedBytesUsername = aesCtr.encrypt(usernameBytes);
  const encryptedHexUsername = aesjs.utils.hex.fromBytes(
    encryptedBytesUsername
  );

  const password = req.body.password;
  const passwordBytes = aesjs.utils.utf8.toBytes(password);
  const encryptedBytesPassword = aesCtr.encrypt(passwordBytes);
  const encryptedHexPassword = aesjs.utils.hex.fromBytes(
    encryptedBytesPassword
  );
  /*
  console.log(encryptedHexUsername, encryptedHexPassword);
  Insert into users(username,password) Values(encryptedHexUsername, encryptedHexPassword);*/
  const sql = escape(
    "select *  FROM users WHERE username = %L AND password = %L",
    encryptedHexUsername,
    encryptedHexPassword
  );
  client.query(sql, (error, response) => {
    console.log(error);
    if (error) {
      req.session.isLoggedin = false;
      throw new Error("Invalid Login!");
    } else if (response.rows.length < 1) {
      req.session.isLoggedin = false;
      res.status(401).send({ message: "Invalid Login" });
    } else {
      req.session.isLoggedin = true;
      res.send({ isLoggedin: req.session.isLoggedin });
    }
  });
});

app.get("/customers", (req, res) => {
  if (req.session.isLoggedin) {
    var sql = "SELECT * FROM customers";
    let resData;
    client.query(sql, (error, response) => {
      resData = response.rows;
      res.send(resData);
    });
  } else {
    res.send({ err: "Please login!" });
  }
});

app.get("/customers/:id", (req, res) => {
  if (req.session.isLoggedin) {
    const sql = escape("SELECT * FROM customers WHERE id=%L", req.params.id);
    let resData;
    client.query(sql, (error, response) => {
      const data = response.rows[0];
      if (data) {
        let aesCtr = new aesjs.ModeOfOperation.ctr(
          aes_key,
          new aesjs.Counter()
        );
        const encryptedHexInvoice = data.invoice;
        const encryptedBytesInvoice = aesjs.utils.hex.toBytes(
          encryptedHexInvoice
        );
        const decryptedBytesInvoice = aesCtr.decrypt(encryptedBytesInvoice);
        const decryptedTextInvoice = aesjs.utils.utf8.fromBytes(
          decryptedBytesInvoice
        );
        aesCtr = new aesjs.ModeOfOperation.ctr(aes_key, new aesjs.Counter());
        const encryptedHexPassword = data.password;
        const encryptedBytesPassword = aesjs.utils.hex.toBytes(
          encryptedHexPassword
        );
        const decryptedBytesPassword = aesCtr.decrypt(encryptedBytesPassword);
        const decryptedTextPassword = aesjs.utils.utf8.fromBytes(
          decryptedBytesPassword
        );
        aesCtr = new aesjs.ModeOfOperation.ctr(aes_key, new aesjs.Counter());
        const encryptedHexOthers = data.others;
        const encryptedBytesOthers = aesjs.utils.hex.toBytes(
          encryptedHexOthers
        );
        const decryptedBytesOthers = aesCtr.decrypt(encryptedBytesOthers);
        const decryptedTextOthers = aesjs.utils.utf8.fromBytes(
          decryptedBytesOthers
        );

        resData = [
          {
            id: data.id,
            name: data.name,
            company: data.company,
            invoice: decryptedTextInvoice,
            password: decryptedTextPassword,
            others: decryptedTextOthers
          }
        ];
      } else {
        resData = [
          {
            id: null,
            name: null,
            company: null,
            invoice: null,
            password: null,
            others: null
          }
        ];
      }
      res.send(resData);
    });
  } else {
    res.send({ err: "Please login!" });
  }
});

app.post("/save/:field", (req, res) => {
  if (req.session.isLoggedin) {
    const field = req.params.field;
    const fieldValue = req.body[field];
    const fieldValueBytes = aesjs.utils.utf8.toBytes(fieldValue);
    const aesCtr = new aesjs.ModeOfOperation.ctr(aes_key, new aesjs.Counter());
    const encryptedBytesFieldValue = aesCtr.encrypt(fieldValueBytes);
    const encryptedHexFieldValue = aesjs.utils.hex.fromBytes(
      encryptedBytesFieldValue
    );
    const customerId = req.body.id;
    const sql = escape(
      "UPDATE customers SET %s=%L WHERE id=%L;",
      field,
      encryptedHexFieldValue,
      customerId.toString()
    );
    client.query(sql, (error, response) => {
      console.log(error);
      res.send({ respoonse: "success!!" });
    });
  } else {
    res.send({ err: "Please login!" });
  }
});

app.post("/add", (req, res) => {
  if (req.session.isLoggedin) {
    const name = req.body.name;
    const company = req.body.company;
    const sql = escape(
      "INSERT INTO customers(name, company, invoice, password, others) VALUES(%L, %L,'','','')",
      name,
      company
    );
    client.query(sql, (error, response) => {
      console.log(error);
      if (error) {
        throw new Error("DB error!");
      }
      res.send({ respoonse: "success!!" });
    });
  } else {
    res.send({ err: "Please login!" });
  }
});

app.post("/delete", (req, res) => {
  if (req.session.isLoggedin) {
    const customerId = req.body.customerId;
    const sql = escape(
      "DELETE FROM customers WHERE id = %L",
      customerId.toString()
    );
    client.query(sql, (error, response) => {
      console.log(error);
      if (error) {
        throw new Error("DB error!");
      }
      res.send({ respoonse: "success!!" });
    });
  } else {
    res.send({ err: "Please login!" });
  }
});

app.get("/download", (req, res) => {
    if (req.session.isLoggedin) {
        var sql = "SELECT * FROM customers";
        let resData;
        client.query(sql, (error, response) => {
            resData = response.rows;
            try {
                res.send({data: resData});
            } catch (err) {
                console.error(err);
            }
            //res.send(resData);
        });
    } else {
        res.send({ err: "Please login!" });
    }
});

app.get("*", function(request, response) {
  response.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});

app.listen(port, () => console.log(`Listening on port ${port}`));
