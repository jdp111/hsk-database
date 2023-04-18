"use strict";

/** Routes for authentication. */

const jsonschema = require("jsonschema");

const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const userAuthSchema = require("../schemas/userAuth.json");
const { BadRequestError } = require("../expressError");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");


/* returns a signed JWT*/

function createToken(user) {
    console.assert(user.isAdmin !== undefined,
        "createToken passed user without isAdmin property");
  
    let payload = {
      username: user.username,
      isAdmin: user.isAdmin || false,
    };
    
    return jwt.sign(payload, SECRET_KEY);
  }


/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/token", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userAuthSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const { username, password } = req.body;
    const user = await User.login(username, password);
    const token = createToken(user);
    return res.json({ token });
    
  } catch (err) {
    return next(err);
  }
});
 

/** POST /auth/register:   { user } => { token }
 *
 * user must include { username, password}
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/register", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userAuthSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const newUser = await User.register({ ...req.body, isAdmin: false });
    const token = createToken(newUser);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
