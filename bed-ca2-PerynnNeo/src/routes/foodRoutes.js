const express = require('express');
const router = express.Router();
const controller = require('../controllers/foodController');
const userController = require('../controllers/usersController');
const jwtController = require('../middlewares/jwtMiddleware'); 

////////////////////////////////////////////////////////////////////////////
// Section B       
////////////////////////////////////////////////////////////////////////////

// -- User eat/sell food POST /food/:foodId/users/:id   ||   Body Params: eatOrSell, quantity
router.post('/:foodId/users/:id', 
    jwtController.verifyToken,             // Step 1: Verify the JWT token
    userController.checkUserExists,        // Step 2: Check if the user exists
    controller.checkFoodExists,            // Step 3: Check if the food exists
    controller.getFoodDetails,             // Step 4: Get food details (skillpoints and money)
    controller.updateInventory,            // Step 5: Update inventory (decrease quantity)
    controller.eatOrSellFoodScore          // Step 6: Update the user's score and money based on 'eat' or 'sell'
);

module.exports = router;