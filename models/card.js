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

class Card {


    static async getUserCards(username){
        const cards = await db.query(`
            SELECT cards.word_id, cards.group_number, chinese_words.simplified, chinese_words.traditional, chinese_words.pinyin, chinese_words.english
            FROM cards JOIN chinese_words ON cards.word_id = chinese_words.id
            WHERE cards.username = $1
            ORDER BY cards.word_id
            
        `, [username])

        return cards.rows
    }



   static async getByGroup(username, groupNumber){

        const res = await db.query(`
            SELECT simplified, traditional, pinyin, english, group_number
            FROM cards JOIN chinese_words
            ON cards.word_id = chinese_words.id
            WHERE (cards.username = $1) AND (cards.group_number = $2)
        `,[username, groupNumber])

        return res.rows
    }

    /** apply for a card
    * 
    * takes a username and a card for the application
    * then adds the application to the application table, 
    * 
    * returns card id if added, or error if not found
    */
    static async addCard(username, word_id){
        
        let dupeCheck = await db.query(`
            SELECT username, word_id FROM cards
            WHERE (username = $1) AND (word_id = $2)
        `,[username,word_id])

        if(dupeCheck.rows[0]) return {"error": "card already included in your current deck"}

        let result = await db.query(
        `INSERT INTO cards (username, word_id)
        VALUES ($1, $2)
        RETURNING word_id` ,
        [username,word_id])

        return result.rows[0]
    }

    static async updateGroup(username, word_id, groupNumber){
        const card = await db.query(`
            UPDATE cards
            SET group_number = $3
            WHERE (username = $1) AND (word_id = $2)
            RETURNING *
        `, [username, word_id, groupNumber])
        
        if (!card.rows[0]) throw new BadRequestError(`card not found`);
        

        return card.rows[0]
    }

    static async deleteCard(username, word_id){
        const res = await db.query(`
        DELETE FROM cards WHERE
        (username = $1) AND (word_id = $2)
        RETURNING word_id
        `, [username, word_id])

        if (!res.rows[0]) throw new BadRequestError(`card not found`);
        
        return res.rows[0]
    }

   
}

module.exports = Card