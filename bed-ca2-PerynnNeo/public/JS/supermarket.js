document.addEventListener("DOMContentLoaded", function () {
    const ingredientsContainer = document.getElementById("ingredientsContainer");
    const userBalanceElement = document.getElementById("userBalance");
    const currentUrl = window.location.protocol + "//" + window.location.host;
    const token = localStorage.getItem("token"); // Retrieve token for authentication

    // Fetch user balance from the /users/:id/progress endpoint
    function fetchUserBalance() {
      const userId = "me"; // Use "me" if the backend resolves the authenticated user
      fetchMethod(`${currentUrl}/api/users/${userId}/progress?onlyMoney=true`, (status, response) => {
        if (status === 200 && response.money !== undefined) {
          userBalanceElement.textContent = `$${response.money.toFixed(2)}`;
        } else {
          console.error("Error fetching user balance:", response.message || "Unknown error");
        }
      }, "GET", null, token);
    }

    // Fetch ingredients from the supermarket
    function fetchIngredients() {
      fetchMethod(`${currentUrl}/api/ingredients/supermarket`, (status, data) => {
        if (status === 200) {
          console.log("API Response:", data); // Debugging log
          if (Array.isArray(data.items)) {
            displayIngredients(data.items); // Use `data.items` as the array of ingredients
          } else {
            console.error("Error: Expected an array in 'items', but got:", data);
          }
        } else {
          console.error("Error fetching ingredients:", data.message || "Unknown error");
        }
      });
    }
  
// Display ingredients as cards
function displayIngredients(ingredients) {
  ingredientsContainer.innerHTML = ""; // Clear container
  ingredients.forEach((ingredient) => {
    const card = document.createElement("div");
    card.className = "col-lg-4 col-md-6 col-sm-12";
    card.innerHTML = `
      <div class="card h-100 shadow">
        <img src="${ingredient.image || `../img/ingredient__${ingredient.ingredient_id}_-removebg-preview.png`}" 
             class="card-img-top" 
             alt="${ingredient.name}">
        <div class="card-body text-center">
          <h5 class="card-title">${ingredient.name}</h5>
          <p class="card-text">${ingredient.description || "No description available"}</p>
          <p class="card-text"><strong>Price: $${ingredient.price.toFixed(2)}</strong></p>
          ${token ? `<button class="btn btn-primary buy-button" data-id="${ingredient.ingredient_id}" style="background-color: var(--accent-color); border: none;">Buy</button>` : ""}
        </div>
      </div>
    `;
    ingredientsContainer.appendChild(card);
  });

  // Attach event listeners to buy buttons only if token exists
  if (token) {
    document.querySelectorAll(".buy-button").forEach((button) => {
      button.addEventListener("click", handlePurchase);
    });
  }
}
  
    // Handle ingredient purchase
    function handlePurchase(event) {
        const ingredientId = event.target.getAttribute("data-id");
        const quantity = 1; // Default quantity for purchase      
        const data = { quantity: quantity };
      
        fetchMethod(`${currentUrl}/api/ingredients/${ingredientId}/users/me`, (status, response) => {
          if (status === 200) {
            // Update the toast message
            const toastMessage = document.getElementById("toastMessage");
            toastMessage.textContent = `Successfully purchased ${quantity} of ${response.ingredientName}`;
      
            // Show the toast
            const purchaseToast = new bootstrap.Toast(document.getElementById("purchaseToast"));
            purchaseToast.show();
      
            fetchUserBalance(); // Refresh the user's balance
          } else {
            alert(response.message || "Error occurred during purchase.");
          }
        }, "POST", data, token);
      }
  
  // Fetch user balance and ingredients on page load
  fetchUserBalance();
  fetchIngredients();
  });