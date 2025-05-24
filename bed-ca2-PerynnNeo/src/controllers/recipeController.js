const model = require("../models/recipeModel");
const userModel = require("../models/usersModel");

// RECIPE CONTROLLER 

////////////////////////////////////////////////////////////////////////////
// Recipe Management
////////////////////////////////////////////////////////////////////////////

// 1. unlockEligibleRecipes - Unlock recipes based on user skill points.
module.exports.unlockEligibleRecipes = (req, res, next) => {
    const userId = res.locals.userId;

    model.getUserSkillpoints(userId, (error, userResults) => {
        if (error) {
            console.error('Error fetching user skillpoints:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (userResults.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userSkillpoints = userResults[0].skillpoints;

        model.getAllRecipes((error, recipeResults) => {
            if (error) {
                console.error('Error fetching recipes:', error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (recipeResults.length === 0) {
                return res.status(404).json({ message: 'No recipes found' });
            }

            const unlockableRecipes = recipeResults.filter(recipe => recipe.skillpoints_required <= userSkillpoints);

            let processedCount = 0;

            if (unlockableRecipes.length === 0) {
                return next(); // No eligible recipes, move to the next middleware
            }

            unlockableRecipes.forEach(recipe => {
                model.isRecipeUnlocked(userId, recipe.recipe_id, (error, isUnlocked) => {
                    if (error) {
                        console.error('Error checking unlocked recipe:', error);
                        return res.status(500).json({ message: 'Internal Server Error' });
                    }

                    if (!isUnlocked) {
                        model.unlockRecipe(userId, recipe.recipe_id, (error) => {
                            if (error) {
                                console.error('Error unlocking recipe:', error);
                                return res.status(500).json({ message: 'Internal Server Error' });
                            }
                        });
                    }

                    processedCount++;

                    if (processedCount === unlockableRecipes.length) {
                        next(); // Proceed to the next middleware after processing all recipes
                    }
                });
            });
        });
    });
};
// 2. checkRecipeExistsForUser - Verify if a recipe is unlocked for a specific user.
module.exports.checkRecipeExistsForUser = (req, res, next) => {
    const userId = res.locals.userId;

    model.checkUnlockedRecipeExists(userId, (error, results) => {
        if (error) {
            console.error('Error checking unlocked recipes:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No unlocked recipes found for this user' });
        }

        next(); // Proceed to the next middleware
    });
};
// 3. checkRecipeExists - Check if a recipe exists by its ID.
module.exports.checkRecipeExists = (req, res, next) => {
    const recipeId = req.params.id;

    model.checkRecipeExists(recipeId, (error, results) => {
        if (error) {
            console.error('Error checking recipe existence:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        next(); // Proceed to the next controller
    });
};
// 4. getProfitByUserId - Retrieve profits for a specific user based on their unlocked recipes.
module.exports.getProfitByUserId = (req, res) => {
    const userId = res.locals.userId;

    model.getUserProfits(userId, (error, results) => {
        if (error) {
            console.error('Error fetching user profits:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No profits found for this user' });
        }

        return res.status(200).json({
            user_id: userId,
            recipe_details: results.map(recipe => ({
                recipe_id: recipe.recipe_id,
                recipe_name: recipe.recipe_name,
                skillpoints_gain: parseInt(recipe.skillpoints_gain),
                money_gain: parseInt(recipe.money_gain),
                ingredient_cost: parseInt(recipe.ingredient_cost),
                net_profit: parseInt(recipe.net_profit),
                description: recipe.description
            }))
        });
    });
};

// 5. getProfitForAll - Retrieve profits for all recipes in the system.
module.exports.getProfitForAll = (req, res) => {
    model.getAllRecipeProfits((error, results) => {
        if (error) {
            console.error('Error fetching all recipe profits:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No recipes found' });
        }

        return res.status(200).json({
            recipes: results.map(recipe => ({
                recipe_id: recipe.recipe_id,
                recipe_name: recipe.recipe_name,
                skillpoints_gain: recipe.skillpoints_gain,
                money_gain: recipe.money_gain,
                ingredient_cost: parseInt(recipe.ingredient_cost),
                net_profit: parseInt(recipe.net_profit),
                description: recipe.description
            }))
        });
    });
};
// 6. getDetailedRecipe - Get a detailed recipe along with its ingredients by recipe ID.
module.exports.getDetailedRecipe = (req, res) => {
    const recipeId = req.params.id;

    model.getDetailedRecipe(recipeId, (error, recipeDetails) => {
        if (error) {
            console.error('Error fetching detailed recipe:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (recipeDetails.length === 0) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Format response
        const recipe = recipeDetails[0];
        const ingredients = recipeDetails.map(detail => ({
            ingredient_id: detail.ingredient_id,
            ingredient_name: detail.ingredient_name,
            quantity: detail.quantity
        }));

        return res.status(200).json({
            recipe_id: recipeId,
            recipe_name: recipe.recipe_name,
            skillpoints_gain: recipe.skillpoints_gain,
            money_gain: recipe.money_gain,
            description: recipe.description,
            ingredients: ingredients
        });
    });
};

// 7. Check if a recipe is unlocked for a user.
module.exports.checkUnlockedRecipes = (req, res, next) => {
    data = {
        userId: res.locals.userId,
        recipeId: req.params.recipeId
    }

    const callback = (error, result) => {
        if (error) {
            console.error('Error checking unlocked recipe:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        if (result.length === 0) {
            return res.status(400).json({ message: 'Recipe not unlocked' });
        }
        next();
    };
    model.checkUnlockedRecipes(data.userId, data.recipeId, callback)
};

// 8. Remove required ingredients for a recipe from the user's inventory.
module.exports.removeIngredients = (req, res, next) => {
    const userId = res.locals.userId;
    const recipeId = req.params.recipeId;

    // Step 1: Get the required ingredients for the recipe
    model.getRequiredIngredients(recipeId, (error, ingredients) => {
        if (error) {
            console.error('Error fetching required ingredients:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (!ingredients || ingredients.length === 0) {
            return res.status(400).json({ message: 'No ingredients required for this recipe.' });
        }

        // Step 2: Validate if the user has enough of each ingredient
        let remainingChecks = ingredients.length;
        let errorOccurred = false;

        ingredients.forEach((ingredient) => {
            userModel.checkUserInventory(userId, ingredient.ingredient_id, (checkError, inventory) => {
                if (checkError) {
                    console.error('Error checking user inventory:', checkError);
                    if (!errorOccurred) {
                        errorOccurred = true;
                        return res.status(500).json({ message: 'Internal Server Error' });
                    }
                }

                // Validate if user has enough ingredients
                if (!inventory || inventory.length === 0 || inventory[0].quantity < ingredient.quantity) {
                    if (!errorOccurred) {
                        errorOccurred = true;
                        return res.status(400).json({
                            message: `Not enough ${ingredient.name} in inventory to craft the recipe.`
                        });
                    }
                }

                // Decrement remaining checks
                remainingChecks--;

                // If all checks are complete and valid, proceed to deduction
                if (remainingChecks === 0 && !errorOccurred) {
                    deductIngredients();
                }
            });
        });

        // Step 3: Deduct ingredients from inventory
        const deductIngredients = () => {
            let remainingDeductions = ingredients.length;

            ingredients.forEach((ingredient) => {
                model.removeIngredientFromInventory(userId, ingredient.ingredient_id, ingredient.quantity, (removeError) => {
                    if (removeError) {
                        console.error('Error removing ingredient from inventory:', removeError);
                        if (!errorOccurred) {
                            errorOccurred = true;
                            return res.status(500).json({ message: 'Internal Server Error' });
                        }
                    }

                    // Check updated inventory
                    userModel.checkUserInventory(userId, ingredient.ingredient_id, (checkError, inventory) => {
                        if (checkError) {
                            console.error('Error checking updated inventory:', checkError);
                            if (!errorOccurred) {
                                errorOccurred = true;
                                return res.status(500).json({ message: 'Internal Server Error' });
                            }
                        }

                        if (inventory && inventory[0].quantity === 0) {
                            model.deleteIngredientFromInventory(userId, ingredient.ingredient_id, (deleteError) => {
                                if (deleteError) {
                                    console.error('Error deleting ingredient from inventory:', deleteError);
                                    if (!errorOccurred) {
                                        errorOccurred = true;
                                        return res.status(500).json({ message: 'Internal Server Error' });
                                    }
                                }
                            });
                        }

                        remainingDeductions--;
                        if (remainingDeductions === 0 && !errorOccurred) {
                            next(); // Proceed to the next middleware
                        }
                    });
                });
            });
        };
    });
};

// 9. Insert the crafted recipe into the user's inventory.
module.exports.insertIntoInventory = (req, res) => {
    const data = {
        userId: res.locals.userId,
        recipeId: req.params.recipeId
    };

    // Step 1: Check if the crafted food is already in the inventory
    model.checkIfFoodExistsInInventory(data, (error, result) => {
        if (error) {
            console.error('Error checking if food exists in inventory:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (result.length > 0) {
            // If the food already exists, update the quantity
            const existingQuantity = result[0].quantity;
            const newQuantity = existingQuantity + 1;  // Increase the quantity by 1

            model.updateFoodQuantityInInventory(data.userId, data.recipeId, newQuantity, (error, updateResult) => {
                if (error) {
                    console.error('Error updating food quantity in inventory:', error);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }

                return res.status(201).json({ message: 'Recipe crafted successfully. Quantity updated in inventory.' });
            });
        } else {
            // If the food doesn't exist inside the inventory, insert it into the inventory
            model.insertCraftedRecipeIntoInventory(data, (error, insertResult) => {
                if (error) {
                    console.error('Error inserting into inventory:', error);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }

                return res.status(201).json({ message: 'Recipe crafted successfully. Added to inventory.' });
            });
        }
    });
};
