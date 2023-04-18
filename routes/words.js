"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureIsAdmin} = require("../middleware");
const Word = require("../models/word");

const wordSchema= require("../schemas/wordNew.json");
const wordSortSchema = require("../schemas/wordSort.json");
const router = new express.Router();


/** POST / { word } =>  { word }
 *
 * word should be { simplified, traditional, pinyin, english }
 *verified by schema
 * Returns { simplified, english }
 *
 * Authorization required: login and admin
 */

router.post("/", ensureLoggedIn,ensureIsAdmin, async function (req, res, next) {
  try {

    const validator = jsonschema.validate(req.body, wordSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs)
    }

    const word = await Word.create(req.body, req.query.lvl);
    return res.status(201).json({ word });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { words: [ {  }, ...] }
 *
 * Can filter on provided search filters:
 * - traditional
 * - simplified
 * - pinyin
 * - english
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {
    if(!Object.values(req.query)[0]) throw new BadRequestError("URL must include query string that is one of: {'simplified', 'traditional', 'pinyin','english','lvl'}")
    const validator = jsonschema.validate(req.query, wordSortSchema);
    if(!validator.valid){
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
    }

    if(Object.keys(req.query)[0] == "pinyin")  {req.query.pinyin = req.query.pinyin.toLowerCase()}
    if(Object.keys(req.query)[0] == "english")  req.query.english = req.query.english.toLowerCase()
    // fix this to lowercase all inputs
    const words = await Word.find(Object.values(req.query)[0], Object.keys(req.query)[0]);
    
    return res.json( words)

  } catch (err) {
    return next(err);
  }
});


/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

router.delete("/:simplified", ensureLoggedIn, ensureIsAdmin, async function (req, res, next) {
  try {
    const result = await Word.remove(req.params.simplified);
    return res.json( result );
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
