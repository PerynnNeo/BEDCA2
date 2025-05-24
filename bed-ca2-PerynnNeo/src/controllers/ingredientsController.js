const model = require("../models/ingredientsModel");
const userModel = require('../models/usersModel');

////////////////////////////////////////////////////////////////////////////
// Available Ingredients
////////////////////////////////////////////////////////////////////////////

// 1. viewSupermarket - Retrieve a list of all available ingredients in the supermarket.
module.exports.viewSupermarket = (req, res) => {
    model.getSupermarketItems((error, results) => {
        if (error) {
            console.error('Error fetching supermarket items:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No items found in the supermarket' });
        }

        return res.status(200).json({
            message: 'Supermarket items retrieved successfully',
            items: results.map(item => ({
                ingredient_id: item.ingredient_id,
                name: item.name,
                price: item.price,
                description: item.description
            }))
        });
    });
};
////////////////////////////////////////////////////////////////////////////
// Purchased Ingredients
////////////////////////////////////////////////////////////////////////////

// 1. Get details of purchased ingredients for a user.
module.exports.getPurchasedIngredients = (req, res) => {
    const userId = res.locals.userId; // Get user ID from the URL parameter

    model.getPurchasedIngredients(userId, (error, results) => {
        if (error) {
            console.error('Error fetching purchased ingredients:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No purchased ingredients found for the user' });
        }

        return res.status(200).json(results); // Return the list of purchased ingredients
    });
};

////////////////////////////////////////////////////////////////////////////
// Ingredient Management
////////////////////////////////////////////////////////////////////////////

// 1. Check if an ingredient exists in the Supermarket by its ID.
module.exports.checkIngredientExists = (req, res, next) => {
    const data = {
        ingredientId: req.params.ingredientId
    };
  
    const callback = (error, results) => {
      if (error) {
        console.error('Error checking ingredient existence:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'Ingredient not found' });
      }
      req.ingredientPrice = results[0].price;
      res.locals.ingredientName = results[0].name;
      next();  // Proceed to checking user balance controller
    };
    model.checkIngredientDetails(data, callback); 
};

// 2. Verify if a user has enough balance to purchase ingredients.
module.exports.verifyUserBalance = (req, res, next) => {
    if (req.body.quantity == undefined || req.body.quantity <= 0) {
        return res.status(400).json({ message: 'Quantity value is missing or invalid' });
    }
    const data = {
        userId: res.locals.userId,
        ingredientId: req.params.ingredientId,
        quantity: req.body.quantity
    }

    const ingredientPrice = req.ingredientPrice;
    const totalCost = ingredientPrice * data.quantity;

    userModel.checkUserMoney(data.userId, totalCost, (error, userResult) => {
        if (error) {
            console.error('Error checking user balance:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        if (userResult.length === 0 || userResult[0].money < totalCost) {
            return res.status(400).json({ message: 'Not enough money' });
        }

        req.totalCost = totalCost;  // Store total cost for the next controller
        next(); // Proceed to deduct supermarket stocks controller
    });
};

// 3. Record the purchase of ingredients in the purchase history.
module.exports.recordPurchaseInHistory = (req, res, next) => {
    const data = {
        userId: res.locals.userId,
        ingredientId: req.params.ingredientId,
        quantity: req.body.quantity
    };

    // Check if the ingredient already exists in the user's purchase history
    userModel.checkUserInventory(data.userId, data.ingredientId, (error, results) => {
        if (error) {
            console.error("Error checking ingredient in purchase history:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        if (results.length > 0) {
            // Ingredient exists, update the quantity
            model.updatePurchaseQuantity(data, (updateError) => {
                if (updateError) {
                    console.error("Error updating purchase quantity:", updateError);
                    return res.status(500).json({ message: "Internal Server Error" });
                }
                next(); // Proceed to update user's money controller
            });
        } else {
            // Ingredient does not exist, insert a new record
            model.purchaseIngredient(data, (insertError) => {
                if (insertError) {
                    console.error("Error recording ingredient:", insertError);
                    return res.status(500).json({ message: "Internal Server Error" });
                }
                
                next(); // Proceed to update user's money controller
            });
        }
    });
};

// 4. Deduct the cost of ingredients from the user's balance.
module.exports.updateUserBalance = (req, res) => {
    const data = {
        userId: res.locals.userId,
        totalCost: req.totalCost
    }

    const callback = (error, results) => {
        if (error) {
            console.error('Error updating user balance:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        return res.status(200).json({ message: 'Purchase successful', ingredientName: res.locals.ingredientName, });
    };
    userModel.updateUserMoney(data, callback)
};