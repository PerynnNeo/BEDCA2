document.addEventListener("DOMContentLoaded", function () {
    // Get the current URL and extract the recipe ID from the query parameters
    const currentUrl = window.location.protocol + "//" + window.location.host;
    const recipeId = new URLSearchParams(window.location.search).get("recipeId");
    const token = localStorage.getItem("token");

    // Get references to DOM elements for displaying recipe details
    const recipeImage = document.getElementById("recipeImage");
    const recipeName = document.getElementById("recipeName");
    const recipeDescription = document.getElementById("recipeDescription");
    const skillpointsGain = document.getElementById("skillpointsGain");
    const moneyGain = document.getElementById("moneyGain");
    const ingredientsContainer = document.getElementById("ingredientsContainer");

    /* 
     * Function: fetchRecipeDetail
     * Fetches detailed information about the selected recipe from the API.
     */
    function fetchRecipeDetail() {
        fetchMethod(`${currentUrl}/api/recipes/${recipeId}`, (status, response) => {
            if (status === 200 && response) {
                displayRecipeDetail(response);
            } else {
                console.error("Error fetching recipe detail:", response.message || "Unknown error");
            }
        }, "GET", null, token);
    }

    /* 
     * Function: displayRecipeDetail
     * Displays the retrieved recipe details on the page.
     */
    function displayRecipeDetail(recipe) {
        // Update recipe details with fetched data
        recipeImage.src = recipe.image || `../img/recipes (${recipe.recipe_id}).png`;
        recipeName.textContent = recipe.recipe_name;
        recipeDescription.textContent = recipe.description || "No description available";
        skillpointsGain.textContent = recipe.skillpoints_gain;
        moneyGain.textContent = recipe.money_gain;

        /* 
         * Populate ingredients dynamically
         * If the recipe contains ingredients, display them as cards.
         */
        if (Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
            ingredientsContainer.innerHTML = ""; // Clear previous content
            recipe.ingredients.forEach((ingredient) => {
                const card = document.createElement("div");
                card.className = "col-md-4";
                card.innerHTML = `
                    <div class="card h-100 shadow">
                        <img src="${ingredient.image || `../img/ingredient__${ingredient.ingredient_id}_-removebg-preview.png`}"  
                            class="card-img-top" alt="${ingredient.ingredient_name}">
                        <div class="card-body text-center">
                            <h5 class="card-title">${ingredient.ingredient_name}</h5>
                            <p class="card-text"><strong>Quantity:</strong> x${ingredient.quantity}</p>
                        </div>
                    </div>
                `;
                ingredientsContainer.appendChild(card);
            });
        } else {
            ingredientsContainer.innerHTML = `<p class="text-center">No ingredients available</p>`;
        }
    }

    // Fetch and display recipe details on page load
    fetchRecipeDetail();
});
