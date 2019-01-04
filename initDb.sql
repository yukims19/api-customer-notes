CREATE TABLE SESSION(
       sid VARCHAR(225) NOT NUll,
       sess json NOT NULL,
       expire TIMESTAMP NOT NULL
);

CREATE TABLE customers(
       id SERIAL,
       name TEXT,
       company TEXT,
       invoice TEXT,
       password TEXT,
       others TEXT
);

CREATE TABLE users(
       id SERIAL,
       username TEXT,
       password TEXT
);

