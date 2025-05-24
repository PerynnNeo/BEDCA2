document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.getElementById("signupForm");
    const warningCard = document.getElementById("warningCard");
    const warningText = document.getElementById("warningText");

    signupForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const confirmPassword = document.getElementById("confirmPassword").value.trim();

      // Clear previous warning message (if any)
      warningCard.classList.add("d-none");
      warningText.innerText = "";

      // Validate form inputs
      if (!username || !email || !password || !confirmPassword) {
        warningCard.classList.remove("d-none");
        warningText.innerText = "All fields are required.";
        return;
      }

      if (!/^\S+@\S+\.\S+$/.test(email)) {
        warningCard.classList.remove("d-none");
        warningText.innerText = "Please enter a valid email address.";
        return;
      }

      if (password !== confirmPassword) {
        // Handle password mismatch
        warningCard.classList.remove("d-none");
        warningText.innerText = "Passwords do not match.";
        return;
      }

      if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
        warningCard.classList.remove("d-none");
        warningText.innerText = "Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.";
        return;
      }

      // Construct data object for API request
      const data = {
        username: username,
        email: email,
        password: password,
      };

      // Callback function for API response
      const callback = (responseStatus, responseData) => {
        console.log("responseStatus:", responseStatus);
        console.log("responseData:", responseData);
        if (responseStatus === 200) {
          // Registration successful
          if (responseData.token) {
            localStorage.setItem("token", responseData.token); // Store the token
            window.location.href = "profile.html"; // Redirect to profile page
          }
        } else {
          // Handle API errors
          warningCard.classList.remove("d-none");
          warningText.innerText = responseData.message || "An error occurred.";
        }
      };

      // Send API request
      const currentUrl = window.location.protocol + "//" + window.location.host;
      fetchMethod(currentUrl + "/api/register", callback, "POST", data);

      // Reset form fields after submission
      signupForm.reset();
      warningCard.classList.add("d-none");
    });
  });

  