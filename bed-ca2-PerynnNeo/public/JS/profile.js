document.addEventListener("DOMContentLoaded", function () {
  // ---------- DOM ELEMENTS ----------
  const usernameElement = document.getElementById("username");
  const descriptionElement = document.getElementById("description");
  const skillpointsElement = document.getElementById("skillpoints");
  const moneyElement = document.getElementById("money");
  const totalMoneyEarnedElement = document.getElementById("total_money_earned");
  const recipesUnlockedElement = document.getElementById("recipes_unlocked");
  const challengesCompletedElement = document.getElementById("challenges_completed");

  const editUsername = document.getElementById("editUsername");
  const editDescription = document.getElementById("editDescription");
  const saveProfileButton = document.getElementById("saveProfileButton");
  const editProfileModal = new bootstrap.Modal(document.getElementById("editProfileModal"));

  const toastMessage = document.getElementById("toastMessage");
  const purchaseToast = new bootstrap.Toast(document.getElementById("purchaseToast"));

  // ---------- OTHER VARIABLES ----------
  const token = localStorage.getItem("token");
  const urlParams = new URLSearchParams(window.location.search);
  let userId = urlParams.get("user_id"); // User ID from URL
  let loggedInUserId = null;

  console.log("Extracted User ID from URL:", userId);

  if (token) {
      // If logged in, fetch logged-in user's ID first
      fetchMethod(`${currentUrl}/api/users/me/progress`, (status, response) => {
          if (status === 200 && response.user_id) {
              loggedInUserId = response.user_id;
              console.log("Logged-in User ID:", loggedInUserId);
          }
          fetchUserProfile(); // Fetch profile whether logged in or not
      }, "GET", null, token);
  } else {
      fetchUserProfile(); // Fetch profile directly if no token
  }

  // ----------------------------------------------
  // FETCH USER PROFILE (OWN OR ANOTHER’S)
  // ----------------------------------------------
  function fetchUserProfile() {
      const profileUserId = userId || loggedInUserId;
      console.log("Fetching profile for user:", profileUserId);
  
      fetchMethod(`${currentUrl}/api/users/${profileUserId}/progress`, (status, response) => {
          if (status === 200) {
              console.log("Fetched User Profile Data:", response);
              displayUserProfile(response, profileUserId);
          } else {
              console.error("Error fetching user profile:", response);
              showToast("Failed to fetch user profile", false);
          }
      }, "GET", null, token);
  }

  // ----------------------------------------------
  // DISPLAY USER PROFILE DATA IN THE UI
  // ----------------------------------------------
  function displayUserProfile(user, profileUserId) {
      if (!user) {
          console.error("User profile data is empty or undefined.");
          return;
      }
  
      // Populate the UI elements
      usernameElement.textContent = user.username || "Unknown User";
      descriptionElement.textContent = user.description || "No description available.";
      skillpointsElement.textContent = user.skillpoints || "0";
      moneyElement.textContent = `${user.money || "0"}`;
      totalMoneyEarnedElement.textContent = `${user.total_money_earned || "0"}`;
      recipesUnlockedElement.textContent = user.recipes_unlocked || "0";
      challengesCompletedElement.textContent = user.challenges_completed || "0";
  
      // Populate edit fields
      editUsername.value = user.username || "";
      editDescription.value = user.description || "";
  
      // Show edit button only for logged-in user's profile
      const editButton = document.getElementById("editProfileButton");
      if (loggedInUserId && profileUserId === loggedInUserId) {
          usernameElement.textContent = `Welcome, ${user.username || "Unknown User"}!`;
          editButton.style.display = "block";
      } else {
          editButton.style.display = "none";
      }
  }

  // ----------------------------------------------
  // SHOW TOAST
  // ----------------------------------------------
  function showToast(message, isSuccess = true) {
      toastMessage.textContent = message;
      const toastElement = document.getElementById("purchaseToast");
      toastElement.classList.toggle("text-bg-success", isSuccess);
      toastElement.classList.toggle("text-bg-danger", !isSuccess);
      purchaseToast.show();
  }

  // ----------------------------------------------
  // SAVE PROFILE CHANGES (PUT /users/:id)
  // ----------------------------------------------
  saveProfileButton.addEventListener("click", function () {
      const updatedUsername = editUsername.value.trim();
      const updatedDescription = editDescription.value.trim();
  
      if (!updatedUsername) {
          showToast("Username cannot be empty.", false);
          return;
      }
  
      const data = {
          username: updatedUsername,
          skillpoints: skillpointsElement.textContent,
          description: updatedDescription
      };
  
      fetchMethod(`${currentUrl}/api/users/${loggedInUserId}`, (status, response) => {
          if (status === 200) {
              showToast("Profile updated successfully!", true);
              fetchUserProfile(); // Refresh UI
              editProfileModal.hide();
          } else {
              showToast("Failed to update profile.", false);
          }
      }, "PUT", data, token);
  });
});
