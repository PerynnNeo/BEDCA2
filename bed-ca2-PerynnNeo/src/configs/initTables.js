// ##############################################################
// REQUIRE MODULES
// ##############################################################
const pool = require("../services/db");

// ##############################################################
// DEFINE SQL STATEMENTS
// ##############################################################
const SQLSTATEMENT = `
DROP TABLE IF EXISTS Inventory;
DROP TABLE IF EXISTS Recipe_Foods;
DROP TABLE IF EXISTS Recipes;
DROP TABLE IF EXISTS PurchasedIngredients;
DROP TABLE IF EXISTS Supermarket;
DROP TABLE IF EXISTS Scores;
DROP TABLE IF EXISTS UserCompletion;
DROP TABLE IF EXISTS FitnessChallenge;
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS UnlockedRecipes;
DROP TABLE IF EXISTS Reviews;

CREATE TABLE User ( 
 user_id INT AUTO_INCREMENT PRIMARY KEY, 
 username TEXT NOT NULL,
 description TEXT,
 email TEXT NOT NULL,
 password TEXT NOT NULL, 
 skillpoints INT,
 money INT NOT NULL DEFAULT 100,
 total_money_earned INT DEFAULT 0
); 
 
CREATE TABLE FitnessChallenge ( 
    challenge_id INT AUTO_INCREMENT PRIMARY KEY,
    challenge TEXT NOT NULL, 
    creator_id INT NOT NULL, 
    skillpoints INT NOT NULL 
); 

INSERT INTO FitnessChallenge (creator_id, challenge, skillpoints) VALUES
(1, 'Complete 2.4km within 15 minutes', 50),
(1, 'Cycle around the island for at least 50km', 100),
(2, 'Complete a full marathon (42.2km)', 200),
(2, 'Hold a plank for 5 minutes', 50),
(2, 'Perform 100 push-ups in one session', 75);

CREATE TABLE UserCompletion ( 
    complete_id INT AUTO_INCREMENT PRIMARY KEY, 
    challenge_id INT NOT NULL, 
    user_id INT NOT NULL, 
    completed BOOL NOT NULL, 
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    notes TEXT 
); 

-- Supermarket Table
CREATE TABLE Supermarket (
    ingredient_id INT PRIMARY KEY AUTO_INCREMENT,
    name TEXT NOT NULL,
    price INT NOT NULL,
    description TEXT NOT NULL
);

INSERT INTO Supermarket (name, price, description) VALUES
('Tomato', 2, 'Juicy red fruit for cooking or salads'),
('Cheese', 4, 'Creamy dairy perfect for melting or snacking'),
('Flour', 3, 'Essential for baking and thickening recipes'),
('Milk', 5, 'Versatile dairy for drinking or cooking'),
('Egg', 3, 'Protein-packed essential for baking and breakfast'),
('Lettuce', 2, 'Crisp leafy green for salads or sandwiches'),
('Chicken Breast', 8, 'Lean protein great for grilling or roasting'),
('Rice', 4, 'Staple grain for versatile side dishes'),
('Carrot', 2, 'Sweet orange root for snacking or cooking'),
('Potato', 3, 'Versatile tuber for mashing, frying, or roasting'),
('Onion', 2, 'Pungent bulb adding flavor to dishes'),
('Butter', 5, 'Rich dairy for cooking and baking'),
('Sugar', 4, 'Sweetener for desserts and beverages'),
('Salt', 1, 'Essential seasoning for enhancing flavors'),
('Chocolate', 8, 'Sweet treat perfect for desserts or snacking'),
('Bacon', 6, 'Crispy smoked pork for breakfast or garnishes'),
('Oil', 3, 'Cooking essential for frying and sautéing'),
('Soda', 4, 'Fizzy drink for refreshment and enjoyment'),
('Candy Bar', 5, 'Sweet chocolatey snack for instant energy'),
('Frozen Pizza', 10, 'Quick meal topped with cheese and toppings');

-- PurchasedIngredients Table
CREATE TABLE PurchasedIngredients (
    purchase_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1
);

-- Recipes Table
CREATE TABLE Recipes (
    recipe_id INT PRIMARY KEY AUTO_INCREMENT,
    name TEXT NOT NULL,
    skillpoints_required INT NOT NULL,
    skillpoints_gain INT NOT NULL,
    money_gain INT NOT NULL,
    description TEXT NOT NULL
);

INSERT INTO Recipes (name, skillpoints_required, skillpoints_gain, money_gain, description) VALUES
-- Healthy Recipes
('Cheese Sandwich', 100, 10, 10, 'Simple, healthy sandwich with melted cheese'),    -- Ingredient cost: 8, Net profit: 2
('Chicken Salad', 150, 11, 22, 'Fresh and nutritious salad with chicken'),   -- Ingredient cost: 19, Net profit: 3
('Vegetable Soup', 250, 15, 16, 'Warm, hearty soup with fresh vegetables'),    -- Ingredient cost: 12, Net profit: 4
('Omelette', 400, 40, 23, 'Protein-packed dish made with eggs'),         -- Ingredient cost: 19, Net profit: 4
('Carrot Juice', 550, 30, 14, 'Refreshing juice rich in vitamins'),    -- Ingredient cost: 11, Net profit: 3
('Grilled Chicken', 700, 100, 28, 'Perfectly grilled lean chicken, high in protein'),   -- Ingredient cost: 18, Net profit: 10

-- Unhealthy Recipes (Higher base money_gain but capped net profit)
('Soda Drink', 120, -8, 10, 'Sugary and fizzy drink, enjoyable but not healthy'),        -- Ingredient cost: 4, Net profit: 6
('Fried Snacks', 230, -12, 25, 'Crunchy fried treats, delicious but indulgent'),   -- Ingredient cost: 15, Net profit: 10
('Candy Bar', 250, -5, 10, 'Sweet chocolate snack with minimal nutrition'),        -- Ingredient cost: 5, Net profit: 5
('Pizza', 300, -20, 25, 'Quick and tasty meal, but processed'),    -- Ingredient cost: 10, Net profit: 15
('Bacon Burger', 350, -25, 40, 'Rich, savory burger with crispy bacon'),     -- Ingredient cost: 20, Net profit: 20
('Chocolate Cake', 600, -40, 74, 'Decadent dessert loaded with sugar and flavor');   -- Ingredient cost:24, Net profit: 50

-- Recipe_Foods Table
CREATE TABLE Recipe_Foods (
    recipe_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity INT NOT NULL
);

INSERT INTO Recipe_Foods (recipe_id, ingredient_id, quantity) VALUES
-- Healthy Recipes
(1, 1, 2),  -- Cheese Sandwich: Tomato (2 x 2 = 4)
(1, 2, 1),  -- Cheese (4 x 1 = 4)

(2, 6, 2),  -- Chicken Salad: Lettuce (2 x 2 = 4)
(2, 7, 1),  -- Chicken Breast (8 x 1 = 8)
(2, 9, 2),  -- Carrot (2 x 2 = 4)
(2, 5, 1),  -- Egg (3 x 1 = 3)

(3, 9, 2),  -- Vegetable Soup: Carrot (2 x 2 = 4)
(3, 10, 2), -- Potato (3 x 2 = 6)
(3, 11, 1), -- Onion (2 x 1 = 2)

(4, 5, 3),  -- Omelette: Egg (3 x 3 = 9)
(4, 12, 2), -- Butter (5 x 2 = 10)

(5, 9, 3),  -- Carrot Juice: Carrot (2 x 3 = 6)
(5, 4, 1),  -- Milk (5 x 1 = 5)

(6, 7, 2),  -- Grilled Chicken: Chicken Breast (8 x 2 = 16)
(6, 11, 1), -- Onion (2 x 1 = 2)

-- Unhealthy Recipes
(7, 18, 1), -- Soda Drink: Soda (4 x 1 = 4)

(8, 16, 2), -- Fried Snacks: Bacon (6 x 2 = 12)
(8, 17, 1), -- Oil (3 x 1 = 3)

(9, 19, 1), -- Candy Bar: Candy Bar (5 x 1 = 5)

(10, 20, 1), -- Frozen Pizza: Frozen Pizza (10 x 1 = 10)

(11, 16, 2), -- Bacon Burger: Bacon (6 x 2 = 12)
(11, 12, 1), -- Butter (5 x 1 = 5)
(11, 3, 1),  -- Flour (3 x 1 = 3)

(12, 15, 2), -- Chocolate Cake: Chocolate (8 x 2 = 16)
(12, 13, 2); -- Sugar (4 x 2 = 8)

-- UnlockedRecipes Table
CREATE TABLE UnlockedRecipes (
    user_id INT NOT NULL, 
    recipe_id INT NOT NULL,
    unlocked_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Table
CREATE TABLE Inventory (
    food_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1
);

CREATE TABLE Reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  review_amt INT NOT NULL,
  user_id INT NOT NULL,
  challenge_id INT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


`;

// ##############################################################
// RUN SQL STATEMENTS
// ##############################################################
pool.query(SQLSTATEMENT, (error, results, fields) => {
  if (error) {
    console.error("Error creating tables:", error);
  } else {
    console.log("Tables created successfully");
  }
  process.exit();
});