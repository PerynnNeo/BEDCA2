const pool = require("../services/db");

////////////////////////////////////////////////////////////////////////////
// Section B       
////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////
// Recipe Unlock and Skillpoint Management
////////////////////////////////////////////////////////////////////////////

/**
 * Get the skill points of a user by their user ID.
 * Table: User
 */
module.exports.getUserSkillpoints = (userId, callback) => {
    const SQLSTATEMENT = `SELECT skillpoints FROM User WHERE user_id = ?`;
    const VALUES = [userId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

/**
 * Retrieve all recipes with their details.
 * Table: Recipes
 */
module.exports.getAllRecipes = (callback) => {
    const SQLSTATEMENT = `SELECT recipe_id, name, skillpoints_required FROM Recipes`;
    pool.query(SQLSTATEMENT, callback);
};



/**
 * Check if a recipe is unlocked for a specific user.
 * Table: UnlockedRecipes
 */
module.exports.checkUnlockedRecipes = (userId, recipeId, callback) => {
    const SQLSTATEMENT = `SELECT * FROM UnlockedRecipes WHERE user_id = ? AND recipe_id = ?`;
    const VALUES = [userId, recipeId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};
/**
 * Check if a recipe is unlocked for a specific user. Boolean result
 * Table: UnlockedRecipes
 */
module.exports.isRecipeUnlocked = (userId, recipeId, callback) => {
    const SQLSTATEMENT = `SELECT 1 FROM UnlockedRecipes WHERE user_id = ? AND recipe_id = ? LIMIT 1;`;
    const VALUES = [userId, recipeId];
    pool.query(SQLSTATEMENT, VALUES, (error, results) => {
        if (error) return callback(error);
        callback(null, results.length > 0); // Return true if unlocked, false otherwise
    });
}

/**
 * Unlock a recipe for a user.
 * Table: UnlockedRecipes
 */
module.exports.unlockRecipe = (userId, recipeId, callback) => {
    const SQLSTATEMENT = `INSERT INTO UnlockedRecipes (user_id, recipe_id) VALUES (?, ?)`;
    const VALUES = [userId, recipeId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

/**
 * Check if any recipe exists for a specific user.
 * Table: UnlockedRecipes
 */
module.exports.checkUnlockedRecipeExists = (userId, callback) => {
    const SQLSTATEMENT = `SELECT 1 FROM UnlockedRecipes WHERE user_id = ? LIMIT 1`;
    const VALUES = [userId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};
/**
 * Check if a specific recipe exists in the user's inventory.
 * Table: Inventory
 */
module.exports.checkIfFoodExistsInInventory = (data, callback) => {
    const SQLSTATEMENT = `SELECT quantity FROM Inventory WHERE user_id = ? AND recipe_id = ?`;
    const VALUES = [data.userId, data.recipeId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

////////////////////////////////////////////////////////////////////////////
// Recipe Profit and Cost Management
////////////////////////////////////////////////////////////////////////////

/**
 * Get the profit details of all unlocked recipes for a user.
 * Table: UnlockedRecipes, Recipes, Recipe_Foods, Supermarket
 */
module.exports.getUserProfits = (userId, callback) => {
    const SQLSTATEMENT = `
        SELECT 
            r.recipe_id,
            r.name AS recipe_name,
            r.money_gain AS money_gain,
            r.skillpoints_gain AS skillpoints_gain,
            r.description,
            SUM(rf.quantity * s.price) AS ingredient_cost,
            (r.money_gain - SUM(rf.quantity * s.price)) AS net_profit
        FROM UnlockedRecipes ur
        JOIN Recipes r ON ur.recipe_id = r.recipe_id
        LEFT JOIN Recipe_Foods rf ON r.recipe_id = rf.recipe_id
        LEFT JOIN Supermarket s ON rf.ingredient_id = s.ingredient_id
        WHERE ur.user_id = ?
        GROUP BY r.recipe_id, r.name, r.money_gain
        ORDER BY r.recipe_id ASC`;
    const VALUES = [userId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

/**
 * Check if a specific recipe exists by its ID.
 * Table: Recipes
 */
module.exports.checkRecipeExists = (recipeId, callback) => {
    const SQLSTATEMENT = `SELECT recipe_id FROM Recipes WHERE recipe_id = ?`;
    const VALUES = [recipeId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

/**
 * Get the profit details of a specific recipe by its ID.
 * Table: Recipes, Recipe_Foods, Supermarket
 */
module.exports.getRecipeProfit = (recipeId, callback) => {
    const SQLSTATEMENT = `
        SELECT 
            r.name AS recipe_name,
            r.money_gain AS money_gain,
            r.skillpoints_gain AS skillpoints_gain,
            SUM(rf.quantity * s.price) AS ingredient_cost,
            (r.money_gain - SUM(rf.quantity * s.price)) AS net_profit
        FROM Recipes r
        LEFT JOIN Recipe_Foods rf ON r.recipe_id = rf.recipe_id
        LEFT JOIN Supermarket s ON rf.ingredient_id = s.ingredient_id
        WHERE r.recipe_id = ?
        GROUP BY r.recipe_id, r.name, r.money_gain`;
    const VALUES = [recipeId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

/**
 * Get the profit details of all recipes.
 * Table: Recipes, Recipe_Foods, Supermarket
 */
module.exports.getAllRecipeProfits = (callback) => {
    const SQLSTATEMENT = `
        SELECT 
            r.recipe_id,
            r.name AS recipe_name,
            r.skillpoints_gain AS skillpoints_gain,
            r.money_gain AS money_gain,
            r.description,
            SUM(rf.quantity * s.price) AS ingredient_cost,
            (r.money_gain - SUM(rf.quantity * s.price)) AS net_profit
        FROM Recipes r
        LEFT JOIN Recipe_Foods rf ON r.recipe_id = rf.recipe_id
        LEFT JOIN Supermarket s ON rf.ingredient_id = s.ingredient_id
        GROUP BY r.recipe_id, r.name, r.money_gain
        ORDER BY r.recipe_id ASC`;
    pool.query(SQLSTATEMENT, callback);
};

////////////////////////////////////////////////////////////////////////////
// Recipe Details and Ingredients
////////////////////////////////////////////////////////////////////////////

/**
 * Get detailed information about a recipe, including its ingredients and costs.
 * Table: Recipes, Recipe_Foods, Supermarket
 */
module.exports.getDetailedRecipe = (recipeId, callback) => {
    const SQLSTATEMENT = `
        SELECT 
            r.name AS recipe_name,
            r.skillpoints_gain,
            r.money_gain,
            r.description,
            rf.ingredient_id,
            s.name AS ingredient_name,
            rf.quantity
        FROM Recipes r
        LEFT JOIN Recipe_Foods rf ON r.recipe_id = rf.recipe_id
        LEFT JOIN Supermarket s ON rf.ingredient_id = s.ingredient_id
        WHERE r.recipe_id = ?
        GROUP BY r.recipe_id, rf.ingredient_id, s.name, rf.quantity
        ORDER BY rf.ingredient_id ASC`;
    const VALUES = [recipeId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

/**
 * Get the required ingredients for a recipe.
 * Table: Recipe_Foods, Supermarket
 */
module.exports.getRequiredIngredients = (recipeId, callback) => {
    const SQLSTATEMENT = `SELECT rf.ingredient_id, rf.quantity, i.name 
                          FROM Recipe_Foods rf
                          JOIN Supermarket i ON rf.ingredient_id = i.ingredient_id
                          WHERE rf.recipe_id = ?`;
    const VALUES = [recipeId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

/**
 * Update the quantity of an ingredient in a user's inventory.
 * Table: PurchasedIngredients
 */
module.exports.removeIngredientFromInventory = (userId, ingredientId, quantity, callback) => {
    const SQLSTATEMENT = `UPDATE PurchasedIngredients 
                          SET quantity = quantity - ? 
                          WHERE user_id = ? AND ingredient_id = ?`;
    const VALUES = [quantity, userId, ingredientId];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

/**
 * Delete a specific ingredient from a user's inventory.
 * Table: PurchasedIngredients
 */
module.exports.deleteIngredientFromInventory = (userId, ingredientId, callback) => {
    const SQLSTATEMENT = `DELETE FROM PurchasedIngredients 
                          WHERE user_id = ? AND ingredient_id = ?`;
    const VALUES = [userId, ingredientId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

/**
 * Update the quantity of an ingredient in a user's inventory.
 * Table: PurchasedIngredients
 */
module.exports.updateFoodQuantityInInventory = (userId, recipeId, newQuantity, callback) => {
    const SQLSTATEMENT = `UPDATE Inventory 
                          SET quantity = ? 
                          WHERE user_id = ? AND recipe_id = ?`;
    const VALUES = [newQuantity, userId, recipeId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

/**
 * Insert a crafted recipe into the user's inventory.
 * Table: Inventory
 */
module.exports.insertCraftedRecipeIntoInventory = (data, callback) => {
    const SQLSTATEMENT = `INSERT INTO Inventory (user_id, recipe_id, quantity) 
                          VALUES (?, ?, 1)`;
    const VALUES = [data.userId, data.recipeId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};