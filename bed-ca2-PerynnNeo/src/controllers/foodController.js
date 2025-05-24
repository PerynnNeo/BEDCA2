const model = require("../models/foodModel");

// Food controllers
// 1. Check if a food exists in the user's inventory.
module.exports.checkFoodExists = (req, res, next) => {
    const data = {
        food_id: req.params.foodId,
        user_id: res.locals.userId
    }

    const callback = (error, results) => {
        if (error) {
            console.error('Error checking food existence:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Food not found' });
        }

        if (results[0].user_id != data.user_id) {
            return res.status(403).json({message: 'food does not belong to user'});
        }
        req.recipeId = results[0].recipe_id
        next();
    };
    model.checkFoodExists(data, callback);
};

// 2. Get detailed information for a recipe by food ID.
module.exports.getFoodDetails = (req, res, next) => {
    const recipeId = req.recipeId; // Retrieved from middleware

    // Step 1: Get the skillpoints_gain and money_gain from the Recipes table using the recipe_id
    model.getRecipeDetails(recipeId, (error, recipeResult) => {
        if (error) {
            console.error('Error fetching recipe details:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (recipeResult.length === 0) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Step 2: Return the skillpoints_gain and money_gain from the recipe
        const foodDetails = {
            skillpoints: recipeResult[0].skillpoints_gain,
            money: recipeResult[0].money_gain
        };

        req.foodDetails = foodDetails;  // Store food details in request object for later use
        next();  // Proceed to the next controller (eatOrSellFoodScore)
    });
};

module.exports.updateInventory = (req, res, next) => {
    if (
        req.body.quantity == undefined ||
        (req.body.eatOrSell !== "eat" && req.body.eatOrSell !== "sell")
    ) {
        return res.status(400).json({ message: "Quantity/eatOrSell value is invalid" });
    }

    const userId = res.locals.userId;
    const foodId = req.params.foodId;
    const quantity = req.body.quantity;

    // Step 1: Update inventory quantity
    model.updateFoodQuantity(userId, foodId, quantity, (updateError, updateResult) => {
        if (updateError) {
            console.error("Error updating food inventory:", updateError);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        if (updateResult.affectedRows === 0) {
            // No rows updated: insufficient quantity
            return res.status(400).json({ message: "Not enough food in inventory" });
        }

        // Step 2: Delete food if quantity becomes 0
        model.deleteFoodIfZeroQuantity(userId, foodId, (deleteError) => {
            if (deleteError) {
                console.error("Error deleting food from inventory:", deleteError);
                return res.status(500).json({ message: "Internal Server Error" });
            }

            next(); // Proceed to the next middleware
        });
    });
};

// 4. Process the "eat" or "sell" action for food and update user score/money.
module.exports.eatOrSellFoodScore = (req, res) => {
    const userId = res.locals.userId;  
    const eatOrSell = req.body.eatOrSell
    const quantity = req.body.quantity

    // Get the food details (skillpoints and money associated with the food)
    const { skillpoints, money } = req.foodDetails;  // Retrieved from previous controller

    const skillpointsChange = skillpoints * quantity;  // Calculate skillpoints change
    const moneyChange = money * quantity;  // Calculate money change

    // Process the 'eat' action (increase skillpoints)
    if (eatOrSell === 'eat') {
        model.updateUserSkillpoints(userId, skillpointsChange, (error, result) => {
            if (error) {
                console.error('Error processing food eat:', error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            return res.status(200).json({ message: 'Food eaten successfully' });
        });
    } 
    // Process the 'sell' action (increase money)
    else if (eatOrSell === 'sell') {
        model.updateUserMoney(userId, moneyChange, (error, result) => {
            if (error) {
                console.error('Error processing food sell:', error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            return res.status(200).json({ message: 'Food sold successfully' });
        });
    } 
    // If 'eatOrSell' is neither 'eat' nor 'sell', return a bad request error
    else {
        return res.status(400).json({ message: "'eatOrSell' must be either 'eat' or 'sell'" });
    }
};