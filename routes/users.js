"use strict";

/** Routes for users. */

const express = require("express");
const { ensureLoggedIn, ensureIsAdmin, ensureAdminOrUser } = require("../middleware");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");

const router = express.Router();

/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: login
 **/

router.delete("/:username", ensureLoggedIn,ensureAdminOrUser, async function (req, res, next) {
  try {
    const username = req.params.username
    const deleted = await User.remove(username);
    return res.json({deleted});
  } catch (err) {
    return next(err);
  }
});

router.get("/:username", ensureLoggedIn, ensureAdminOrUser, async function (req, res, next){
  try {
    const username = req.params.username
    const userInfo = await User.getInfo(username)
    return res.json(userInfo)
  } catch (err) {
    return next(err)
  }
});

router.put("/:username", ensureLoggedIn, ensureAdminOrUser, async function(req, res, next){
    try{
        const username = req.params.username
        const sessionNumber = await User.increaseSession(username)
        return res.json(sessionNumber)
    } catch (err) {
        return next(err);
    }
})

module.exports = router;
