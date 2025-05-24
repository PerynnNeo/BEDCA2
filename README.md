# BED CA2 - Recipe-Based System

## Introduction
BED CA2 is a full-stack recipe-based system with additional fitness challenge functionalities. Users can purchase ingredients, craft foods, unlock recipes, participate in fitness challenges, and manage their progress, all while tracking their in-game currency and skill points. This system integrates multiple database tables and routes to provide an engaging experience.

## Features
- **User Authentication & Management**
  - Secure login and registration with password hashing and JWT authentication.
  - Users have a profile with skill points and a balance of in-game money.

- **Supermarket & Ingredients**
  - Users can buy ingredients from the supermarket.
  - Purchased ingredients are stored in the `PurchasedIngredients` table.

- **Recipe System**
  - Recipes have skill points and money rewards.
  - Users must unlock recipes before crafting foods.
  - Crafted foods are stored in the inventory.

- **Fitness Challenge System**
  - Users can create and complete fitness challenges.
  - Completing a challenge rewards skill points.
  - Challenge completion is recorded in `UserCompletion`.

- **Review System**
  - Users can review fitness challenges.
  - Reviews include ratings and optional feedback.

## Database Schema
### Tables Overview
1. **User**: Tracks user details, skill points, and money balance.
2. **FitnessChallenge**: Stores available fitness challenges.
3. **UserCompletion**: Tracks users who have completed challenges.
4. **Supermarket**: Stores ingredients available for purchase.
5. **PurchasedIngredients**: Logs ingredients bought by users.
6. **Recipes**: Stores details about recipes.
7. **Recipe_Foods**: Links recipes to required ingredients.
8. **UnlockedRecipes**: Tracks recipes unlocked by users.
9. **Inventory**: Maintains a list of crafted foods.
10. **Reviews**: Stores user-submitted reviews of challenges.

## API Routes
### User Authentication
- **POST /login** - User login with password hashing and JWT authentication.
- **POST /register** - New user registration with secure password storage.

### Challenges
- **POST /challenges** - Create a new challenge (requires authentication).
- **GET /challenges** - Retrieve all challenges.
- **PUT /challenges/:challenge_id** - Update a challenge (requires authentication and authorization).
- **DELETE /challenges/:challenge_id** - Delete a challenge (requires authentication and authorization).
- **POST /challenges/:challenge_id** - Mark a challenge as completed and update user skill points.
- **GET /challenges/:challenge_id** - Retrieve all users who completed a specific challenge.

### Recipes & Food
- **POST /recipes/:recipeId/users/:id** - User crafts food by consuming ingredients and gaining rewards.
- **GET /recipes** - Retrieve all recipes and their profitability.
- **GET /recipes/user/:id** - Get a specific user's unlocked recipes and their profits.
- **GET /recipes/:id** - Retrieve detailed recipe information.

### Ingredients & Supermarket
- **GET /ingredients/supermarket** - Retrieve all available ingredients.
- **GET /ingredients/users/:id** - Retrieve purchased ingredients for a user.
- **POST /ingredients/:ingredientId/users/:id** - Buy an ingredient from the supermarket.

### Inventory Management
- **POST /food/:foodId/users/:id** - User eats or sells crafted food, updating their score and money.
- **GET /users/:id/inventory** - Retrieve the user’s inventory.

### Reviews
- **GET /reviews** - Retrieve all reviews.
- **POST /reviews/challenges/:challenge_id** - Submit a review for a challenge.
- **GET /reviews/challenges/:challenge_id** - Retrieve all reviews for a challenge.
- **PUT /reviews/:review_id** - Update a review.
- **DELETE /reviews/:review_id** - Delete a review.

### User Management
- **GET /users** - Retrieve all users.
- **PUT /users/:user_id** - Update user details (requires authentication).
- **GET /users/:userId/progress** - Retrieve a user's skill points and money progress.


## Setup & Installation
### Prerequisites
- A web server environment (e.g., Apache, Nginx)
- MySQL or PostgreSQL database
- PHP/Python (depending on implementation)

### Installation Steps
1. Clone the repository:
   ```sh
   git clone https://github.com/ST0503-BED/st0503-bed-ay2425s2-bed-ca2-blank-ca-repository 
   cd your-repo-folder
   ```
2. Set up the database:
   - Import the SQL schema provided in `database/schema.sql`
   - Configure the database connection in `config.php` (or `.env` file)
3. Start the web server and access the system via `localhost`

## Usage
1. **Purchase Ingredients**: Navigate to the supermarket and buy ingredients.
2. **Craft Foods**: Use purchased ingredients to cook recipes.
3. **Unlock Recipes**: Earn and unlock new recipes.
4. **Manage Inventory**: View and use crafted foods.
5. **Complete Fitness Challenges**: Complete fitness challenges to gain skillpoints for new recipes
