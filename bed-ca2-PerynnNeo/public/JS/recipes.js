document.addEventListener("DOMContentLoaded", function () {
  const recipesContainer = document.getElementById("recipesContainer");
  const currentUrl = window.location.protocol + "//" + window.location.host;
  const token = localStorage.getItem("token");

  const allRecipesBtn = document.getElementById("allRecipesBtn");
  const yourRecipesBtn = document.getElementById("yourRecipesBtn");

  // Fetch recipes based on the selected toggle
  function fetchRecipes(endpoint) {
    fetchMethod(`${currentUrl}/api/${endpoint}`, (status, response) => {
      if (status === 200) {
        if (endpoint === "recipes") {
          displayRecipes(response.recipes); // Adjust for "All Recipes" structure
        } else if (endpoint.startsWith("recipes/user")) {
          displayRecipes(response.recipe_details); // Adjust for "Your Recipes" structure
        }
      } else if (status === 404) {
        recipesContainer.innerHTML = `
          <div class="text-center mt-4">
            <h5>You currently do not meet the requirements to unlock any recipes.</h5>
            <p>Go to <a href="challenges.html" class="text-decoration-underline" style="color: var(--accent-color);">Challenges</a> to get fit and earn skillpoints!</p>
          </div>
        `;
      } else {
        console.error("Error fetching recipes:", response.message || "Unknown error");
      }
    }, "GET", null, token);
  }

  // Display recipes as cards
  function displayRecipes(recipes) {
    recipesContainer.innerHTML = ""; // Clear the container
    recipes.forEach((recipe) => {
      const card = document.createElement("div");
      card.className = "col-lg-4 col-md-6 col-sm-12";
      card.innerHTML = `
        <div class="card h-100 shadow">
          <img src="${recipe.image || `../img/recipes (${recipe.recipe_id}).png`}" class="card-img-top" alt="${recipe.recipe_name}">
          <div class="card-body text-center">
            <h5 class="card-title">${recipe.recipe_name}</h5>
            <p class="card-text">${recipe.description || "No description available"}</p>
            <p class="card-text"><strong>Skillpoints: ${recipe.skillpoints_gain}</strong></p>
            <p class="card-text"><strong>Selling Price: $${recipe.money_gain}</strong></p>
            <button class="btn btn-primary view-recipe-button" data-id="${recipe.recipe_id}" style="background-color: var(--accent-color); border: none;">View Recipe</button>
          </div>
        </div>
      `;
      recipesContainer.appendChild(card);
    });

    // Attach event listeners to view buttons
    document.querySelectorAll(".view-recipe-button").forEach((button) => {
      button.addEventListener("click", handleViewRecipe);
    });
  }

  // Handle view recipe button click
  function handleViewRecipe(event) {
    const recipeId = event.target.getAttribute("data-id");
    // Redirect to a detailed recipe page or open a modal with detailed info
    window.location.href = `detailedRecipe.html?recipeId=${recipeId}`;
  }

  // Toggle button functionality
  allRecipesBtn.addEventListener("click", function () {
    allRecipesBtn.classList.add("active");
    yourRecipesBtn.classList.remove("active");
    fetchRecipes("recipes"); // Fetch all recipes
  });

  yourRecipesBtn.addEventListener("click", function () {
    allRecipesBtn.classList.remove("active");
    yourRecipesBtn.classList.add("active");
    fetchRecipes("recipes/user/me"); // Fetch user-specific recipes
  });

  // Fetch All Recipes by default on page load
  fetchRecipes("recipes");
});
