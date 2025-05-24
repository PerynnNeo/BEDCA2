const express = require('express');
const router = express.Router()
const controller = require('../controllers/recipeController')
const userController = require('../controllers/usersController')
const jwtController = require('../middlewares/jwtMiddleware'); 

////////////////////////////////////////////////////////////////////////////
// Section B       
////////////////////////////////////////////////////////////////////////////

// -- Retrieve profits for one user's recipes GET /recipes/user/:id
router.get('/user/:id', 
    jwtController.verifyToken,               // Step 1: Verify the JWT token
    userController.checkUserExists,          // Step 2: Verify the user exists
    controller.unlockEligibleRecipes,        // Step 3: Unlock all eligible recipes for the user
    controller.checkRecipeExistsForUser,     // Step 4: Ensure the user has unlocked recipes
    controller.getProfitByUserId             // Step 5: Retrieve profits from unlocked recipes
);

// -- Retrieve profits for all recipes GET /recipes
router.get('/', 
    controller.getProfitForAll
);

// -- Retrieve detailed recipe (with ingredients) GET /recipes/:id
router.get('/:id', 
    controller.checkRecipeExists, 
    controller.getDetailedRecipe
);

// -- User Make food POST /recipes/:recipeId/users/:id
router.post('/:recipeId/users/:id', 
    jwtController.verifyToken,               // Step 1: Verify the JWT token
    userController.checkUserExists,          // Step 2: Check if the user exists
    controller.unlockEligibleRecipes,        // Step 3: Check with all users all possible unlocked recipes  
    controller.checkUnlockedRecipes,         // Step 4: Check if the recipe is unlocked
    controller.removeIngredients,            // Step 5: Remove the required ingredients from inventory
    controller.insertIntoInventory           // Step 6: Add the crafted item to inventory   
);

module.exports = router