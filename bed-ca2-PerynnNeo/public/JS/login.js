document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const warningCard = document.getElementById("warningCard");
    const warningText = document.getElementById("warningText");

    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      // Clear previous warnings
      warningCard.classList.add("d-none");
      warningText.innerText = "";

      // Validate inputs
      if (!username || !password) {
        warningCard.classList.remove("d-none");
        warningText.innerText = "Both username and password are required.";
        return;
      }

      // Data for API
      const data = {
        username: username,
        password: password,
      };

      // Callback function for API response
      const callback = (responseStatus, responseData) => {
        console.log("responseStatus:", responseStatus);
        console.log("responseData:", responseData);
        if (responseStatus === 200) {
          // Login successful
          if (responseData.token) {
            localStorage.setItem("token", responseData.token); // Store token
            window.location.href = "profile.html"; // Redirect to profile page
          }
        } else {
          // Handle login error
          warningCard.classList.remove("d-none");
          warningText.innerText = responseData.message || "Login failed. Please try again.";
        }
      };

      // Perform API request
      const currentUrl = window.location.protocol + "//" + window.location.host;
      fetchMethod(currentUrl + "/api/login", callback, "POST", data);

      // Clear form fields
      loginForm.reset();
    });
  });

  