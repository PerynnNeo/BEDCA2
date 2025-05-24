document.addEventListener("DOMContentLoaded", function () {
  const loggedInNav = document.getElementById("loggedInNav");
  const loggedOutNav = document.getElementById("loggedOutNav");
  const userBalanceElement = document.getElementById("userBalance");
  const userBalanceSection = userBalanceElement ? userBalanceElement.parentElement : null;
  const inventoryButtonContainer = document.getElementById("inventoryButtonContainer");
  const toggleButtonsContainer = document.querySelector(".toggle-buttons");
  const reviewToggle = document.getElementById("reviewToggle");
  const craftButton = document.getElementById("craftButton");
  const token = localStorage.getItem("token");

  function isTokenExpired(token) {
      try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const expiryTime = payload.exp * 1000;
          return Date.now() >= expiryTime;
      } catch (e) {
          return true;
      }
  }

  if (token && !isTokenExpired(token)) {
      loggedInNav.style.display = "block";
      loggedOutNav.style.display = "none";
      if (userBalanceSection) userBalanceSection.style.display = "block";
      if (inventoryButtonContainer) inventoryButtonContainer.style.display = "block";
      if (toggleButtonsContainer) toggleButtonsContainer.style.display = "block";
      if (reviewToggle) reviewToggle.style.display = "block";
      if (craftButton) craftButton.style.display = "block";

      let logoutButton = document.getElementById("logoutButton");
      if (!logoutButton) {
          logoutButton = document.createElement("li");
          logoutButton.className = "nav-item";
          logoutButton.innerHTML = `<a class="nav-link" href="#" id="logoutButton">Logout</a>`;
          loggedInNav.querySelector(".navbar-nav").appendChild(logoutButton);
      }
      
      logoutButton.addEventListener("click", function () {
          localStorage.clear();
          window.location.href = "login.html";
      });
  } else {
      loggedInNav.style.display = "none";
      loggedOutNav.style.display = "block";
      if (userBalanceSection) userBalanceSection.style.display = "none";
      if (inventoryButtonContainer) inventoryButtonContainer.style.display = "none";
      if (toggleButtonsContainer) toggleButtonsContainer.style.display = "none";
      if (reviewToggle) reviewToggle.style.display = "none";
      if (craftButton) craftButton.style.display = "none";
      localStorage.clear();
  }

  document.addEventListener("visibilitychange", function () {
      if (!document.hidden) {
          const updatedToken = localStorage.getItem("token");
          if (!updatedToken || isTokenExpired(updatedToken)) {
              loggedInNav.style.display = "none";
              loggedOutNav.style.display = "block";
              if (userBalanceSection) userBalanceSection.style.display = "none";
              if (inventoryButtonContainer) inventoryButtonContainer.style.display = "none";
              if (toggleButtonsContainer) toggleButtonsContainer.style.display = "none";
              if (reviewToggle) reviewToggle.style.display = "none";
              if (craftButton) craftButton.style.display = "none";
              if (challengeForm) challengeForm.style.display = "none";
              localStorage.clear();
          }
      }
  });
});

document.addEventListener("DOMContentLoaded", function() {
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");

    window.addEventListener("scroll", function() {
        if (window.scrollY > 300) { // Show button after 300px scroll
            scrollToTopBtn.classList.add("show");
        } else {
            scrollToTopBtn.classList.remove("show");
        }
    });

    scrollToTopBtn.addEventListener("click", function() {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});