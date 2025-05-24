const express = require('express');
const router = express.Router()
const controller = require('../controllers/usersController')
const jwtController = require('../middlewares/jwtMiddleware');

////////////////////////////////////////////////////////////////////////////
// Section A
////////////////////////////////////////////////////////////////////////////

// Creates a new user POST /users     || Body params: username
router.post('/', jwtController.verifyToken, controller.checkNew, controller.createUser);
// Retrieves all users in database    
router.get('/', controller.getAllUsers);
// Updates user's details             || Body params: username, skillpoints
router.put('/:user_id',  jwtController.verifyToken, controller.checkOtherUsers, controller.changeDetailsByUserId);

////////////////////////////////////////////////////////////////////////////
// Section B       
////////////////////////////////////////////////////////////////////////////

// // -- User progress GET /users/:id/progress
router.get('/me/progress', jwtController.verifyToken, controller.getMyScore);
router.get('/:userId/progress', controller.getUserScore);


// -- User's Inventory e.g. foods, quantity of foods GET /users/:id/inventory
router.get('/:id/inventory',  jwtController.verifyToken, controller.checkUserExists, controller.getUserInventory)

module.exports = router