document.addEventListener("DOMContentLoaded", function () {
    const profilesContainer = document.getElementById("profilesContainer");
    let loggedInUserId = null;
    const token = localStorage.getItem("token");

    /* 
     * Function: showToast
     * Displays a toast notification with a success or error message.
     */
    function showToast(message, isSuccess = true) {
        const toastEl = document.getElementById("toastContainer");
        const toastMessageEl = document.getElementById("toastMessage");
    
        if (!toastEl || !toastMessageEl) {
            console.error("Toast elements not found in DOM!");
            return;
        }
    
        toastEl.classList.remove("text-bg-success", "text-bg-danger");
        toastEl.classList.add(isSuccess ? "text-bg-success" : "text-bg-danger");
    
        toastMessageEl.innerText = message;
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }

    /* 
     * Function: fetchLoggedInUserId
     * Fetches the currently logged-in user's ID and updates loggedInUserId.
     * Calls the provided callback function after completion.
     */
    function fetchLoggedInUserId(callback) {
        if (!token) {
            callback();
            return;
        }

        fetchMethod(`${currentUrl}/api/users/me/progress`, (status, response) => {
            if (status === 200 && response.user_id) {
                loggedInUserId = response.user_id;
                console.log("Logged-in User ID:", loggedInUserId);
            } else {
                showToast("Failed to fetch logged-in user data", false);
            }
            callback();
        }, "GET", null, token);
    }

    /* 
     * Function: fetchAllProfiles
     * Retrieves a list of all user profiles from the API.
     */
    function fetchAllProfiles() {
        fetchMethod(`${currentUrl}/api/users/`, (status, response) => {
            if (status === 200) {
                displayProfiles(response);
            } else {
                console.error("Error fetching users:", response);
            }
        }, "GET");
    }

    /* 
     * Function: displayProfiles
     * Displays user profiles dynamically in the profiles container.
     */
    function displayProfiles(users) {
        profilesContainer.innerHTML = "";
        users.forEach(user => {
            const card = document.createElement("div");
            card.className = "col-lg-4 col-md-6 col-sm-12";
            
            // Check if the displayed user is the currently logged-in user
            const isCurrentUser = user.user_id === loggedInUserId;
            const highlight = isCurrentUser ? " (You)" : "";
            const userDisplayName = user.username + highlight;
            
            card.innerHTML = `
                <div class="card h-100 shadow-sm p-3">
                    <div class="card-body text-center">
                        <h5 class="card-title fw-bold">${userDisplayName}</h5>
                        <p class="card-text">${user.description || "No bio available"}</p>
                        <button class="btn btn-primary view-details" data-id="${user.user_id}">
                            View Details
                        </button>
                    </div>
                </div>
            `;
            profilesContainer.appendChild(card);
        });

        // Add event listeners to "View Details" buttons
        document.querySelectorAll(".view-details").forEach(button => {
            button.addEventListener("click", function () {
                const userId = this.getAttribute("data-id");
                window.location.href = `profile.html?user_id=${userId}`;
            });
        });
    }

    // Fetch the logged-in user's ID first, then load all profiles
    fetchLoggedInUserId(fetchAllProfiles);
});
