document.addEventListener("DOMContentLoaded", function () {
  // Get the craft button element
  const craftButton = document.getElementById("craftButton");

  // Add click event listener to the craft button
  craftButton.addEventListener("click", function () {
      console.log("Craft button clicked!");

      // Get the recipe ID from the URL parameters
      const recipeId = new URLSearchParams(window.location.search).get("recipeId");
      const token = localStorage.getItem("token");

      // Check if authentication token exists
      if (!token) {
          showToast("Authentication token is missing. Please log in again.", "error");
          console.error("Token is null. User might not be logged in.");
          return;
      }

      console.log("Recipe ID:", recipeId, "Token:", token);

      // Construct the API URL for crafting a recipe
      const url = `${currentUrl}/api/recipes/${recipeId}/users/me`; 
      console.log("Calling API URL:", url);

      // Make API request to craft the recipe
      fetchMethod(
          url,
          (status, response) => {
              console.log("Fetch method callback triggered with status:", status, "Response:", response);

              // Handle successful crafting
              if (status === 201) {
                  showToast("Recipe crafted successfully!", "success");
              } 
              // Handle error cases
              else if (status === 400) {
                  if (response.message.includes("not unlocked")) {
                      showToast("You have not unlocked this recipe.", "error");
                  } else if (response.message.includes("not enough ingredients")) {
                      showToast("Not enough ingredients to craft the recipe.", "error");
                  } else {
                      showToast(response.message || "Bad Request", "error");
                  }
              } 
              // Handle general API errors
              else {
                  showToast(response.message || "An error occurred while crafting the recipe.", "error");
              }
          },
          "POST",
          null,
          token
      );
  });

  /* 
   * Function: showToast
   * Displays a toast notification with a success or error message.
   */
  function showToast(message, type) {
      const toastMessage = document.getElementById("toastMessage");
      const toastElement = document.getElementById("craftToast");

      if (toastMessage && toastElement) {
          // Update toast message dynamically
          toastMessage.textContent = message;

          // Set the appropriate Bootstrap class for success or error
          if (type === "success") {
              toastElement.classList.remove("text-bg-danger");
              toastElement.classList.add("text-bg-success");
          } else {
              toastElement.classList.remove("text-bg-success");
              toastElement.classList.add("text-bg-danger");
          }

          // Show the toast notification
          const toast = new bootstrap.Toast(toastElement);
          toast.show();
      } else {
          console.error("Toast element not found in DOM");
      }
  }
});
