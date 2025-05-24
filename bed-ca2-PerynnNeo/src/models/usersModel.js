const pool = require("../services/db");

module.exports.selectByName = (data, callback) => {
    const SQLSTATEMENT = `SELECT * FROM User WHERE username = ?;`;
    const VALUES = [data.username];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

// module.exports.insertNewUser = (data, callback) => {
//     const SQLSTATEMENT = `INSERT User (username, skillpoints) VALUES (?, 0);`;
//     const VALUES = [data.username];
//     pool.query(SQLSTATEMENT, VALUES, callback);
// }

module.exports.insertNewUser = (data, callback) => {
    const SQLSTATEMENT = `INSERT INTO User (username, email, password, skillpoints) VALUES (?,?,?, 0);`;
    const VALUES = [data.username, data.email, data.password];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

module.exports.getUserbyUsernameOrEmail = (data, callback) => {
    const SQLSTATEMENT = `SELECT * FROM User WHERE username = ? OR email = ?;`
    const VALUES = [data.username, data.email];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

module.exports.selectAllUsers = (callback) => {
    const SQLSTATEMENT = `
    SELECT 
        u.skillpoints, 
        u.description,
        u.money, 
        u.username,
        u.total_money_earned, 
        COUNT(DISTINCT ur.recipe_id) AS recipes_unlocked, 
        u.user_id,
        COUNT(DISTINCT uc.challenge_id) AS challenges_completed
    FROM User u
    LEFT JOIN UnlockedRecipes ur ON u.user_id = ur.user_id
    LEFT JOIN UserCompletion uc ON u.user_id = uc.user_id AND uc.completed = TRUE
    GROUP BY u.user_id, u.skillpoints, u.money, u.total_money_earned;`;
    pool.query(SQLSTATEMENT, callback);
}

module.exports.selectByNameByOtherId = (data, callback) => {
    const SQLSTATEMENT = `SELECT * FROM User WHERE username = ? AND user_id != ?;`;
    const VALUES = [data.username, data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}
module.exports.updateUserDetailsById = (data, callback) => {
    const SQLSTATEMENT = `UPDATE User SET username = ?, skillpoints =?, description =? WHERE user_id = ?;`;
    const VALUES = [data.username, data.skillpoints, data.description, data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}


////////////////////////////////////////////////////////////////////////////
// Section B       
////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////
// User Management
////////////////////////////////////////////////////////////////////////////

/**
 * Check if a user exists by their user ID.
 * Table: User
 */
module.exports.checkUserExists = (data, callback) => {
    const SQLSTATEMENT = `SELECT * FROM User WHERE user_id = ?`;
    const VALUES = [data.userId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

////////////////////////////////////////////////////////////////////////////
// User Inventory and Scores
////////////////////////////////////////////////////////////////////////////

/**
 * Get the user's inventory of crafted recipes.
 * Table: Inventory, Recipes
 */
module.exports.getUserInventory = (userId, callback) => {
    const SQLSTATEMENT = `
        SELECT i.food_id, r.name AS food_name, i.quantity, i.recipe_id, r.description, r.money_gain, r.skillpoints_gain
        FROM Inventory i
        JOIN Recipes r ON i.recipe_id = r.recipe_id
        WHERE i.user_id = ?;
    `;
    const VALUES = [userId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};
/**
 * Check the user's purchasedIngredients for a specific ingredient.
 * Table: Inventory
 */
module.exports.checkUserInventory = (userId, ingredientId, callback) => {
    const SQLSTATEMENT = `SELECT quantity 
                          FROM PurchasedIngredients 
                          WHERE user_id = ? AND ingredient_id = ?`;
    const VALUES = [userId, ingredientId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

/**
 * Delete a specific food item from the user's inventory.
 * Table: Inventory
 */
module.exports.deleteFoodFromInventory = (userId, foodId, callback) => {
    const SQLSTATEMENT = `DELETE FROM Inventory WHERE user_id = ? AND food_id = ?`;
    const VALUES = [userId, foodId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};
/**
 * Check if the user has sufficient money for a purchase.
 * Table: User
 */
module.exports.checkUserMoney = (userId, totalCost, callback) => {
    const SQLSTATEMENT = `SELECT money FROM User WHERE user_id = ? AND money >= ?`;
    const VALUES = [userId, totalCost];
    pool.query(SQLSTATEMENT, VALUES, callback);
};
/**
 * Update the user's money after a transaction.
 * Table: User
 */
module.exports.updateUserMoney = (data, callback) => {
    const SQLSTATEMENT = `UPDATE User SET money = money - ? WHERE user_id = ? AND money >= ?`;
    const VALUES = [data.totalCost, data.userId, data.totalCost];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

/**
 * Get the user's progress (skill points, money, recipes unlocked).
 * Table: User, UnlockedRecipes
 */
module.exports.getUserProgress = (userId, callback) => {
    const SQLSTATEMENT = `
        SELECT 
            u.skillpoints, 
            u.description,
            u.money, 
            u.username,
            u.total_money_earned, 
            COUNT(DISTINCT ur.recipe_id) AS recipes_unlocked, 
            u.user_id,
            COUNT(DISTINCT uc.challenge_id) AS challenges_completed
        FROM User u
        LEFT JOIN UnlockedRecipes ur ON u.user_id = ur.user_id
        LEFT JOIN UserCompletion uc ON u.user_id = uc.user_id AND uc.completed = TRUE
        WHERE u.user_id = ?
        GROUP BY u.user_id, u.skillpoints, u.money, u.total_money_earned;`;
    
    const VALUES = [userId];

    pool.query(SQLSTATEMENT, VALUES, callback);
};

/**
 * Check the quantity of a specific food item in the user's inventory.
 * Table: Inventory
 */
module.exports.checkInventoryQuantity = (userId, foodId, callback) => {
    const SQLSTATEMENT = `SELECT quantity FROM Inventory WHERE user_id = ? AND food_id = ?`;
    const VALUES = [userId, foodId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};
/**
 * Update the quantity of a specific food item in the user's inventory.
 * Table: Inventory
 */
module.exports.updateFoodQuantity = (userId, foodId, quantity, callback) => {
    const SQLSTATEMENT = `UPDATE Inventory 
                          SET quantity = quantity - ? 
                          WHERE user_id = ? AND food_id = ?`;
    const VALUES = [quantity, userId, foodId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};
/**
 * Check the user's inventory for a specific food.
 * Table: Inventory
 */
module.exports.checkUserFoodInventory = (userId, foodId, quantity, callback) => {
    const SQLSTATEMENT = `SELECT quantity FROM Inventory WHERE user_id = ? AND food_id = ?`;
    const VALUES = [userId, foodId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

