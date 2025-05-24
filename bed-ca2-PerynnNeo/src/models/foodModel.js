const pool = require("../services/db");

////////////////////////////////////////////////////////////////////////////
// Section B       
////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////
// Recipe Management
////////////////////////////////////////////////////////////////////////////

/**
 * Get the recipe details for a crafted food.
 * Table: Recipes
 */
module.exports.getRecipeDetails = (recipeId, callback) => {
    const SQLSTATEMENT = `SELECT skillpoints_gain, money_gain FROM Recipes WHERE recipe_id = ?`;
    const VALUES = [recipeId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

/**
 * Check if a food item exists in the inventory by its ID.
 * Table: Inventory
 */
module.exports.checkFoodExists = (data, callback) => {
    const SQLSTATEMENT = `SELECT * FROM Inventory WHERE food_id = ?`;
    const VALUES = [data.food_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

////////////////////////////////////////////////////////////////////////////
// User Inventory and Scores
////////////////////////////////////////////////////////////////////////////
/**
 * Deducts a specified quantity of food from the user's inventory
 * if the available quantity is sufficient (quantity >= ?).
*/
module.exports.updateFoodQuantity = (userId, foodId, quantity, callback) => {
    const SQLSTATEMENT = `
        UPDATE Inventory
        SET quantity = quantity - ?
        WHERE user_id = ? AND food_id = ? AND quantity >= ?;
    `;
    const VALUES = [quantity, userId, foodId, quantity];

    pool.query(SQLSTATEMENT, VALUES, callback);
};
/**
 * Removes a food item from the user's inventory if its quantity reaches zero.
*/
module.exports.deleteFoodIfZeroQuantity = (userId, foodId, callback) => {
    const SQLSTATEMENT = `
        DELETE FROM Inventory
        WHERE user_id = ? AND food_id = ? AND quantity = 0;
    `;
    const VALUES = [userId, foodId];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

/**
 * Update the user's skill points.
 * Table: User
 */
module.exports.updateUserSkillpoints = (userId, skillpointsChange, callback) => {
    const SQLSTATEMENT = `UPDATE User 
                          SET skillpoints = skillpoints + ? 
                          WHERE user_id = ?`;
    const VALUES = [skillpointsChange, userId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

/**
 * Update the user's money, and total_money_earned after selling a food item.
 * Table: User
 */
module.exports.updateUserMoney = (userId, moneyChange, callback) => {
    const SQLSTATEMENT = `UPDATE User 
                          SET money = money + ?, total_money_earned = total_money_earned + ? 
                          WHERE user_id = ?`;
    const VALUES = [moneyChange, moneyChange, userId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};