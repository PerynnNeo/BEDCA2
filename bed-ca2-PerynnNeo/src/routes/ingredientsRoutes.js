const express = require('express');
const router = express.Router();
const controller = require('../controllers/ingredientsController');
const userController = require('../controllers/usersController');
const jwtController = require('../middlewares/jwtMiddleware'); 

////////////////////////////////////////////////////////////////////////////
// Section B       
////////////////////////////////////////////////////////////////////////////

// -- Retrieves available ingredients in the supermarket GET /ingredients/supermarket
router.get('/supermarket', 
    controller.viewSupermarket
);

// -- User's purchased Ingredients GET /ingredients/users/:id
router.get('/users/:id', 
    jwtController.verifyToken,         
    controller.getPurchasedIngredients
);

// -- User Buy Ingredients POST /ingredients/:ingredientId/users/:id   ||   Body Params: Quantity
router.post('/:ingredientId/users/:id',
    jwtController.verifyToken,             // Step 1: Verify the JWT token
    userController.checkUserExists,        // Step 2: Check if user exists
    controller.checkIngredientExists,      // Step 3: Check if ingredient exists
    controller.verifyUserBalance,          // Step 4: Check if user has enough balance
    controller.recordPurchaseInHistory,    // Step 5: Record the purchase 
    controller.updateUserBalance           // Step 6: Update user balance 
);

module.exports = router;