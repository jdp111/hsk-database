# HSK Vocab Database
This API is designed to be used by the [ChineseLearn App](https://github.com/jdp111/chinese-flashcards/tree/main).
It can also be used alone as a Chinese-English dictionary, however it is not comprehensive, and currently only includes about 7000 words. 
The database will expand as I have time to find new sources for chinese words and english translations.

The API is made with Node.js, and uses postgreSQL to communicate with the database. The base URL for access is: https://hsk-database-production.up.railway.app/words?english=u

## Routes
### GET /words? (?english, ?pinyin, ?simplified, ?traditional)
For users without a token, the only accessible route is a GET route to find words. A query is required for this route. searching with a query string finds 
any words that match or include the query

### POST /auth/token
Login route allows a registered user to get a token to access user-only routes

### POST /auth/register
Register route allows a user to be added to the database and get a token. This route is only accessible from the ChineseLearn app

### GET /cards/:username
Get cards that are in a users collection. requires auth token

### POST /cards/add/:username
Adds a card to a user's collection. Body data must include an array of word IDs to add. Duplicate cards will be skipped

### DELETE /cards/delete/:username
Deletes cards from a users deck. Requires the user's token. Accepts an array of word IDs and returns cards that were deleted successfuly. If a card does not exist in the deck, that word will be skipped, and an error message will be returned in its place. all existing cards after will still be deleted

### PUT /users/:username
This route is specifically for tracking progress for flashcards, and determining which flashcards to include in the next test for the user. The route advances the users tst "session" by one.

### DELETE /users/username
Deletes a user. Requires valid token

### POST /words
Adds cards from an array of input. Admin Token is required to add words. Added words must have traditional, simplified, pinyin, and english translations.

### DELETE /words/:simplified
Deleted cards where the simplified characters match the input parameter. Admin Token is required to delete words


