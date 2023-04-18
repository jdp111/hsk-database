"use strict";

/** Routes for users. */

const jsonSchema = require("jsonschema");
const express = require("express");
const { ensureLoggedIn, ensureIsAdmin, ensureAdminOrUser } = require("../middleware");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const Card = require("../models/card");
const addCardSchema = require("../schemas/addCard.json");
const changeGroupSchema = require("../schemas/changeGroup.json");

const router = express.Router();

/** GET /[user id]  => [{simplified, traditional, group_number}]
 *
 * Authorization required: login
 **/

router.get("/:username", ensureLoggedIn,ensureAdminOrUser, async function (req, res, next) {
  try {
    const username = req.params.username
    const cards = await Card.getUserCards(username);
    return res.json(cards);
  } catch (err) {
    return next(err);
  }
});

router.get("/:username/:groupNumber", ensureLoggedIn, ensureAdminOrUser, async function (req, res, next) {
  try {
    const username = req.params.username
    const groupNumber = req.params.groupNumber

    const groupCards = await Card.getByGroup(username, groupNumber)
    return res.json(groupCards)
  }catch(err){ return next(err)}


})

/**
 * update a card's group number for a user
 * used when a user gets a card right and previous group is zero
 * accepts request body of form: {cardId, groupNumber}
 */

router.put("/:username", ensureLoggedIn, ensureAdminOrUser, async function(req, res, next){
    try{
      const validator = jsonSchema.validate(req.body, changeGroupSchema)

      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
      const username = req.params.username
      const {cardId, groupNumber } = req.body
      const result = await Card.updateGroup(username, cardId, groupNumber)
      return res.json(result)
    } catch (err) {
        return next(err);
    }
})



/**
 * adds a card for a user. accepts request bodies of form: {username, cards} where cards is an array of card ids to add
 */
router.post("/add/:username", ensureLoggedIn, ensureAdminOrUser, async function(req, res, next){
  try{
    const validator = jsonSchema.validate(req.body, addCardSchema )
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const username = req.params.username 
    const {cards} = req.body
    let resArr = []
    for (let cardId of cards){
      const card_id = await Card.addCard(username, cardId)
      resArr.push(card_id)
    }

    return res.json(resArr)
  } catch (err) {
      return next(err);
  }
})

router.delete("/delete/:username", ensureLoggedIn, ensureAdminOrUser, async function(req, res, next){

  try{
    const validator = jsonSchema.validate(req.body, addCardSchema )
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const username = req.params.username 
    const {cards} = req.body
    let resArr = []
    for (let cardId of cards){
      const card_id = await Card.deleteCard(username, cardId)
      resArr.push(card_id)
    }

    return res.json(resArr)
  }catch(err){return next(err);}
})



module.exports = router;
