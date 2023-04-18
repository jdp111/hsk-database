"use strict";

const db = require("../db");

class Word {

    /**
    * searches in the column indicated by searchBy
    * searches for rows partially or fully matching the search term
    */
    static async find(term, searchBy) {

        const search = await db.query(
            `SELECT * FROM chinese_words
            WHERE ${searchBy} LIKE $1
            ORDER BY ${searchBy}`,
            ['%'+term+'%']
        )
        return search.rows
    }
    
    /** 
    * create new words in database
    * only accessible from admin
    * returns an error object if the word is a duplicate
    * returns created word if successful
    */
    static async create(wordArr, lvl = 0){
        let partialSql = []
        let newWordList = []
        let indexForSql = 0
        
        for (let word of wordArr){

            const dupe = await db.query(`
                SELECT * FROM chinese_words
                WHERE simplified = $1
            `,[word.simplified])

            if(dupe.rows[0]) return {"duplicate word": dupe.rows[0]}

            newWordList.push(word.simplified, word.traditional, word.pinyin.toLowerCase(), word.english.toLowerCase(), lvl)
            partialSql.push(`($${indexForSql +1},$${indexForSql +2},$${indexForSql +3},$${indexForSql +4}, $${indexForSql +5})`)
            indexForSql += 5
        }
        partialSql = partialSql.join(',')

        try{
            const result = await db.query(
                `INSERT INTO chinese_words (simplified, traditional, pinyin, english,lvl)
                VALUES ${partialSql}
                RETURNING simplified, english`,
                [...newWordList]
            )
            return result.rows
        }catch(e){return e}
        
        

    }

    /**
    * remove a flashword
    * only accessible from admin
    * returns the word that was deleted
    * returns error message if word not found
    */
    static async remove(simplified){
        const deleted = await db.query(
            `DELETE FROM chinese_words
            WHERE simplified = $1
            returning *`,
            [simplified]
        )
        if (deleted.rows[0]) return {"deleted" : deleted.rows[0]}
        return {"error": `'${simplified}' not found`}
    }


}

module.exports = Word;