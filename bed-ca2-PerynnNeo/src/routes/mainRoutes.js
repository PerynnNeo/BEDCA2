const express = require('express');
const router = express.Router();

const challengesRoute = require('./challengesRoutes.js');
const usersRoute = require('./usersRoutes.js');
const recipeRoute = require('./recipeRoutes.js');
const foodRoute = require('./foodRoutes.js');
const ingredientsRoute = require('./ingredientsRoutes.js');
const reviewRoute = require('./reviewRoutes.js');

router.use('/challenges', challengesRoute);
router.use('/users', usersRoute);
router.use('/recipes', recipeRoute);
router.use('/food', foodRoute);
router.use('/ingredients', ingredientsRoute)
router.use('/reviews', reviewRoute);



// Authentication

// const tokenMiddleware = require('../middlewares/tokenMiddleware.js')
const jwtMiddleware = require('../middlewares/jwtMiddleware.js') 
const bcryptMiddleware = require('../middlewares/bcryptMiddleware.js') 
const userController = require('../controllers/usersController.js')

// Login Route
router.post("/login", 
    userController.login,                     // Step 1: Verify the user exists by checking their username/email and retrieving the hashed password.
    bcryptMiddleware.comparePassword,         // Step 2: Compare the provided password with the stored hashed password.
    jwtMiddleware.generateToken,              // Step 3: Generate a JWT token for the authenticated user.
    jwtMiddleware.sendToken                   // Step 4: Send the token back to the client in the response.
);

// Register Route
router.post("/register", 
    userController.checkUsernameOrEmailExist, // Step 1: Check if the username or email already exists in the database.
    bcryptMiddleware.hashPassword,            // Step 2: Hash the password provided by the user for secure storage.
    userController.register,                  // Step 3: Register the new user in the database with the hashed password.
    jwtMiddleware.generateToken,              // Step 4: Generate a JWT token for the newly registered user.
    jwtMiddleware.sendToken                   // Step 5: Send the token back to the client in the response.
);

module.exports = router;