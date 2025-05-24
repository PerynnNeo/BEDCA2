const pool = require("../services/db");

////////////////////////////////////////////////////////////////////////////
// Section B       
////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////
// Supermarket and Ingredients
////////////////////////////////////////////////////////////////////////////

/**
 * Get the list of all available items in the supermarket.
 * Table: Supermarket
 */
module.exports.getSupermarketItems = (callback) => {
    const SQLSTATEMENT = `SELECT ingredient_id, name, price, description FROM Supermarket ORDER BY ingredient_id ASC`;
    pool.query(SQLSTATEMENT, callback);
};
////////////////////////////////////////////////////////////////////////////
// Ingredient Management
////////////////////////////////////////////////////////////////////////////

/**
 * Get details of purchased ingredients for a user.
 * Table: PurchasedIngredients, Supermarket
 */
module.exports.getPurchasedIngredients = (userId, callback) => {
    const SQLSTATEMENT = `
        SELECT pi.ingredient_id, pi.quantity, sm.name, sm.price, sm.description
        FROM PurchasedIngredients pi
        JOIN Supermarket sm ON pi.ingredient_id = sm.ingredient_id
        WHERE pi.user_id = ?`;
    const VALUES = [userId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};
/**
 * Check an ingredient's details to see if it exists in the Supermarket, and their price by its ID.
 * Table: Supermarket
 */
module.exports.checkIngredientDetails = (data, callback) => {
    const SQLSTATEMENT = `SELECT * FROM Supermarket WHERE ingredient_id = ?`;
    const VALUES = [data.ingredientId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};
/**
 * Update the quantity of an ingredient in the purchase history.
 * Table: PurchasedIngredients
 */
module.exports.updatePurchaseQuantity = (data, callback) => {
    const SQLSTATEMENT = `UPDATE PurchasedIngredients 
                          SET quantity = quantity + ? 
                          WHERE user_id = ? AND ingredient_id = ?`;
    const VALUES = [data.quantity, data.userId, data.ingredientId];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

/**
 * Purchase an ingredient and add it to the PurchasedIngredients table.
 * Table: PurchasedIngredients
 */
module.exports.purchaseIngredient = (data, callback) => {
    const SQLSTATEMENT = `INSERT INTO PurchasedIngredients (user_id, ingredient_id, quantity) VALUES (?, ?, ?)`;
    const VALUES = [data.userId, data.ingredientId, data.quantity];
    pool.query(SQLSTATEMENT, VALUES, callback);
};


