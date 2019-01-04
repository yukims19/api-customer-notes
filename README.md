# api-customer-notes

## Run Server

First, create databse using `initDb.sql`.

Then, create a `.env` file which will includes `DATABASE_URL`, `AES_KEY`, and `COOKIE_SECRET`.

Finnaly, uncomment the first line `require("dotenv").load();` in `server.js`.

Start server by
```
yarn
yarn start
```

## Run Client

** Make sure that your server is runing when you start client.

```
yarn
yarn start
```
