DROP DATABASE hsk;
CREATE DATABASE hsk;
\connect hsk

CREATE TABLE chinese_words (
    id SERIAL PRIMARY KEY,
    simplified VARCHAR(7) UNIQUE NOT NULL,
    traditional VARCHAR(7) NOT NULL,
    pinyin VARCHAR(30),
    english TEXT NOT NULL,
    lvl INTEGER
);


CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(25) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    session_number INTEGER DEFAULT 0,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE cards (
        user_id INTEGER NOT NULL
          REFERENCES users ON DELETE CASCADE,
        word_id INTEGER NOT NULL
          REFERENCES chinese_words ON DELETE CASCADE,
        group_number INTEGER DEFAULT 0,
        PRIMARY KEY (user_id, word_id)
);