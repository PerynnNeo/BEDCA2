document.addEventListener("DOMContentLoaded", function () {
  const ingredientsContainer = document.getElementById("ingredientsContainer");
  const foodContainer = document.getElementById("foodContainer");
  const noIngredientsMessage = document.getElementById("noIngredientsMessage");
  const noFoodMessage = document.getElementById("noFoodMessage");

  const currentUrl = window.location.protocol + "//" + window.location.host;
  const token = localStorage.getItem("token");

  let selectedFoodId = null;
  let selectedMaxQuantity = 0;
  let currentQuantity = 1;

  const decreaseBtn = document.getElementById("decreaseQuantity");
  const increaseBtn = document.getElementById("increaseQuantity");
  const quantityDisplay = document.getElementById("quantityDisplay");
  const modal = new bootstrap.Modal(document.getElementById("craftModal"));

  const toastContainer = document.getElementById("toastContainer");
  const toastMessage = document.getElementById("toastMessage");

  // Show Toast Notification
  function showToast(message) {
      toastMessage.textContent = message;
      const toast = new bootstrap.Toast(toastContainer);
      toast.show();
  }

  // Fetch Ingredients
  function fetchIngredients() {
      fetchMethod(`${currentUrl}/api/ingredients/users/me`, (status, data) => {
          if (status === 200 && Array.isArray(data)) {
              if (data.length > 0) {
                  displayIngredients(data);
                  noIngredientsMessage.classList.add("d-none");
              } else {
                  noIngredientsMessage.classList.remove("d-none");
              }
          } else {
              console.error("Error fetching ingredients:", data.message || "Unknown error");
              noIngredientsMessage.classList.remove("d-none");
          }
      }, "GET", null, token);
  }

  // Fetch Food
  function fetchFood() {
      fetchMethod(`${currentUrl}/api/users/me/inventory`, (status, data) => {
          if (status === 200 && data.inventory && Array.isArray(data.inventory)) {
              if (data.inventory.length > 0) {
                  displayFood(data.inventory);
                  noFoodMessage.classList.add("d-none");
              } else {
                  noFoodMessage.classList.remove("d-none");
              }
          } else {
              console.error("Error fetching food:", data.message || "Unknown error");
              noFoodMessage.classList.remove("d-none");
          }
      }, "GET", null, token);
  }

  // Display Ingredients
  function displayIngredients(ingredients) {
      ingredientsContainer.innerHTML = "";
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
                      <p class="card-text">Quantity: x${ingredient.quantity}</p>
                  </div>
              </div>
          `;
          ingredientsContainer.appendChild(card);
      });
  }

  // Display Food
  function displayFood(foodItems) {
      foodContainer.innerHTML = "";
      foodItems.forEach((food) => {
          const card = document.createElement("div");
          card.className = "col-lg-4 col-md-6 col-sm-12";
          card.innerHTML = `
              <div class="card h-100 shadow food-item" data-id="${food.food_id}" data-quantity="${food.quantity}">
                  <img src="${food.image || `../img/recipes (${food.recipe_id}).png`}" class="card-img-top" alt="${food.food_name}">
                  <div class="card-body text-center">
                      <h5 class="card-title">${food.food_name}</h5>
                      <p class="card-text">${food.description || "No description available"}</p>
                      <p class="card-text"><strong>Selling Price:</strong> $${food.money_gain}.00</p>
                      <p class="card-text"><strong>Skillpoints:</strong> ${food.skillpoints_gain}</p>

                      <p class="card-text"><strong>Quantity: x${food.quantity}</strong></p>
                  </div>
              </div>
          `;
          foodContainer.appendChild(card);
      });

      // Attach event listeners to food cards
      document.querySelectorAll(".food-item").forEach((foodCard) => {
          foodCard.addEventListener("click", function () {
              const foodId = this.getAttribute("data-id");
              const maxQuantity = parseInt(this.getAttribute("data-quantity"));
              openCraftModal(foodId, maxQuantity);
          });
      });
  }

  // Open Modal with Food Info
  function openCraftModal(foodId, maxQuantity) {
      selectedFoodId = foodId;
      selectedMaxQuantity = maxQuantity;
      currentQuantity = 1;
      quantityDisplay.textContent = currentQuantity;
      modal.show();
  }

  // Decrease Quantity
  decreaseBtn.addEventListener("click", function () {
      if (currentQuantity > 1) {
          currentQuantity--;
          quantityDisplay.textContent = currentQuantity;
      }
  });

  // Increase Quantity
  increaseBtn.addEventListener("click", function () {
      if (currentQuantity < selectedMaxQuantity) {
          currentQuantity++;
          quantityDisplay.textContent = currentQuantity;
      }
  });

  // Handle 'Eat' action
  document.getElementById("eatButton").addEventListener("click", function () {
      processFoodAction("eat");
  });

  // Handle 'Sell' action
  document.getElementById("sellButton").addEventListener("click", function () {
      processFoodAction("sell");
  });

// Process API Call for Eating or Selling
function processFoodAction(action) {
  const userId = "me";
  const data = { eatOrSell: action, quantity: currentQuantity };

  fetchMethod(`${currentUrl}/api/food/${selectedFoodId}/users/${userId}`, (status, response) => {
      if (status === 200) {
          showToast(`Successfully ${action === "eat" ? "eaten" : "sold"} ${currentQuantity} of food.`);
          modal.hide();

          // Refresh the page after a short delay to allow the toast to be displayed
          setTimeout(() => {
              location.reload();
          }, 1000); // Adjust the delay as needed
      } else {
          showToast(response.message || `Failed to ${action} food.`);
      }
  }, "POST", data, token);
}


  // Fetch Ingredients and Food on Page Load
  fetchIngredients();
  fetchFood();
});
