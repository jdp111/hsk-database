"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with username, password.
   *
   * Returns { username, is_admin }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async login(username, password) {
    // try to find the user first
    const result = await db.query(
          `SELECT
            username,
            password,
            is_admin AS "isAdmin"
           FROM users
           WHERE username = $1`,
        [username]
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        return {username: user.username, isAdmin : user.isAdmin};
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register(
      { username, password, isAdmin=false}) {
    const duplicateCheck = await db.query(
          `SELECT username
           FROM users
           WHERE username = $1`,
        [username],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    
    const result = await db.query(
          `INSERT INTO users
           (username,
            password,
            is_admin)
           VALUES ($1, $2, $3)
           RETURNING username, is_admin AS "isAdmin"`,
        [
          username,
          hashedPassword,
          isAdmin
        ],
    );

    const user = result.rows[0];

    return user;
  }

  /** Find all users.
   *
   * Returns [{ username, is_admin }, ...]
   **/

  static async findAll() {
    const result = await db.query(
          `SELECT
                  username,
                  is_admin AS "isAdmin"
           FROM users
           ORDER BY username`,
    );

    return result.rows;
  }

  

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { Password }
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

  static async updatePW(username, password) {
    const hashW = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(`UPDATE users 
                      SET password = $1
                      WHERE username = $2 
                      RETURNING username,
                                is_admin AS "isAdmin"`,[hashW, username ]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
    return user;
  }

  /** Delete given user from database; returns undefined. */

  static async remove(username) {
    let result = await db.query(
          `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
        [username],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
    return user.username
  }

  /**
  * Session will be a number that cycles before each session
  * options for session number are 0-9
  * 
  */
  static async getInfo(username){

    const sessionNo = await db.query(`
        SELECT session_number FROM users
        WHERE username = $1
    `, [username])

    if( !sessionNo.rows[0]) throw new NotFoundError(`No user: ${username}`)

    const stepUp = (sessionNo.rows[0].session_number ) % 10 + 1
    const updateSession = await db.query(`
        UPDATE users
        SET session_number = $1
        WHERE username = $2
        RETURNING  session_number
    `, [stepUp, username])

    return updateSession.rows[0]
}

  /**
  * Session will be a number that cycles before each session
  * options for session number are 0-9
  * 
  */
  static async increaseSession(username){

        const sessionNo = await db.query(`
            SELECT session_number FROM users
            WHERE username = $1
        `, [username])

        if( !sessionNo.rows[0]) throw new NotFoundError(`No user: ${username}`)

        const stepUp = (sessionNo.rows[0].session_number ) % 10 + 1
        const updateSession = await db.query(`
            UPDATE users
            SET session_number = $1
            WHERE username = $2
            RETURNING  session_number
        `, [stepUp, username])

        return updateSession.rows[0]
    }



}


module.exports = User;
