// Declare global variable for user ID
let loggedInUserId = null;

// Fetch logged-in user's ID
function fetchUserId(callback) {
    const token = localStorage.getItem("token"); // Get authentication token

    // If no token exists, set loggedInUserId to null and continue
    if (!token) {
        console.warn("No token found. Proceeding without user authentication.");
        loggedInUserId = null;
        callback(); // Call the callback to continue loading the page
        return;
    }

    fetchMethod(`${currentUrl}/api/users/me/progress`, (status, response) => {
        if (status === 200 && response.user_id) {
            loggedInUserId = response.user_id;
            console.log("Logged-in User ID:", loggedInUserId); // Debugging log
        } else {
            console.warn("Failed to fetch user data, proceeding without authentication.");
            loggedInUserId = null; // Ensure it's null if request fails
        }
        callback(); // Call the callback regardless of success/failure
    }, "GET", null, token);
}

// Fetch logged-in user's ID before using it
document.addEventListener("DOMContentLoaded", () => {
    fetchUserId(() => {
        loadChallenges(); // Load challenges once
        loadReviews(null); // Ensure initial load displays all reviews
    });
});

//=====================================================================================
// LOAD CHALLENGES WITH FILTER OPTIONS
//=====================================================================================

let activeChallenges = new Set(); // Store active challenge IDs

function loadChallenges() {
    fetchMethod("/api/challenges", (status, challenges) => {
        const filterDropdown = document.getElementById("challenge_filter");
        const addReviewDropdown = document.getElementById("challenge_id");

        if (!filterDropdown || !addReviewDropdown) {
            console.error("Dropdown elements not found!");
            return;
        }

        if (status === 200 && challenges.length > 0) {
            // Clear dropdowns before adding options
            filterDropdown.innerHTML = "";
            addReviewDropdown.innerHTML = "";

            activeChallenges.clear(); // Reset the set

            // Add default "Show all reviews" for filter
            const allOption = document.createElement("option");
            allOption.value = "";
            allOption.textContent = "Show all reviews";
            filterDropdown.appendChild(allOption);

            // Add default "Select Challenge" for add review
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Select a Challenge";
            addReviewDropdown.appendChild(defaultOption);

            // Populate both dropdowns with challenges
            challenges.forEach(challenge => {
                activeChallenges.add(challenge.challenge_id); // Store active challenge ID

                const optionFilter = document.createElement("option");
                optionFilter.value = challenge.challenge_id;
                optionFilter.textContent = `ID: ${challenge.challenge_id} - ${challenge.challenge}`;
                filterDropdown.appendChild(optionFilter);

                const optionAddReview = document.createElement("option");
                optionAddReview.value = challenge.challenge_id;
                optionAddReview.textContent = `ID: ${challenge.challenge_id} - ${challenge.challenge}`;
                addReviewDropdown.appendChild(optionAddReview);
            });

            console.log("Challenges loaded successfully.");
            attachFilterListener();
        } else {
            filterDropdown.innerHTML = '<option value="">No challenges available</option>';
            addReviewDropdown.innerHTML = '<option value="">No challenges available</option>';
        }
    });
}

//=====================================================================================
// ATTACH EVENT LISTENER ONLY TO FILTER DROPDOWN
//=====================================================================================

function attachFilterListener() {
    const filterDropdown = document.getElementById("challenge_filter");

    if (filterDropdown) {
        filterDropdown.addEventListener("change", function () {
            const selectedChallenge = this.value;
            console.log("Filter selected:", selectedChallenge);
            loadReviews(selectedChallenge ? selectedChallenge : null);
        });
    }
}

//=====================================================================================
// FETCH AND DISPLAY REVIEWS (ALL OR FILTERED)
//=====================================================================================

function loadReviews(challengeId = null) {
    const url = challengeId ? `/api/reviews/challenges/${challengeId}` : "/api/reviews";
    const token = localStorage.getItem("token");
    
    fetchMethod(url, (status, reviewsData) => {
        const reviewsContainer = document.getElementById("reviews");
        reviewsContainer.innerHTML = "";

        if (status === 200 && reviewsData.length > 0) {
            reviewsData.forEach(review => {
                const stars = "⭐".repeat(review.review_amt);
                const date = new Date(review.created_at).toISOString().split("T")[0];

                // Check if the challenge is deleted
                const challengeExists = activeChallenges.has(review.challenge_id);
                const challengeText = challengeExists 
                    ? `Challenge ID: ${review.challenge_id}`
                    : `Challenge ID: ${review.challenge_id} <br>(Challenge was deleted)`;

                // Check if the logged-in user created the review
                const isCreator = token && loggedInUserId && loggedInUserId == review.user_id;

                const reviewElement = document.createElement("div");
                reviewElement.classList.add("col-md-4", "mb-4");

                reviewElement.innerHTML = `
                    <div class="card review-card shadow-sm">
                        <div class="card-body text-center">
                            <h5 class="card-title">${review.username}</h5>
                            <div class="review-stars fs-4">${stars}</div>
                            <small class="text-muted">${date} | ${challengeText}</small>
                            <p class="card-text">${review.reason ? review.reason : "No comment provided"}</p>
                            ${isCreator ? `
                                <div class="button-container mt-2">
                                    <button class="btn btn-sm btn-warning edit-btn" 
                                            data-id="${review.id}" 
                                            data-rating="${review.review_amt}" 
                                            data-reason="${review.reason}" 
                                            onclick="openEditModal(event)" 
                                            data-bs-toggle="modal" 
                                            data-bs-target="#editReviewModal">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger delete-btn" 
                                            data-id="${review.id}" 
                                            data-bs-toggle="modal" 
                                            data-bs-target="#deleteReviewModal">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            ` : ""}
                        </div>
                    </div>
                `;

                reviewsContainer.appendChild(reviewElement);
            });

            // Attach event listeners for edit and delete buttons
            document.querySelectorAll(".edit-btn").forEach(btn => {
                btn.addEventListener("click", openEditModal);
            });

            document.querySelectorAll(".delete-btn").forEach(btn => {
                btn.addEventListener("click", openDeleteModal);
            });

        } else {
            reviewsContainer.innerHTML = `<p class="text-muted">No reviews found.</p>`;
        }
    });
}



//=====================================================================================
// DELETE REVIEW
//=====================================================================================

function openDeleteModal(event) {
    // Ensure we get the button, even if user clicks the icon inside it
    const button = event.target.closest("button");
    if (!button) {
        showToast("Error: Could not find delete button.", false);
        return;
    }

    const reviewId = button.getAttribute("data-id");
    if (!reviewId) {
        showToast("Error: Review ID is missing!", false);
        return;
    }

    console.log("Deleting Review ID:", reviewId); // Debugging log

    document.getElementById("deleteReviewId").value = reviewId;
}

function deleteReview() {
    const reviewId = document.getElementById("deleteReviewId").value;
    const token = localStorage.getItem("token");

    if (!reviewId) {
        showToast("Error: Review ID is missing!", false);
        return;
    }

    fetchMethod(`/api/reviews/${reviewId}`, (status, response) => {
        if (status === 204) {
            showToast("Review deleted successfully!");

            // Get the currently selected filter challenge ID
            const selectedFilterChallenge = document.getElementById("challenge_filter").value;

            // Reload reviews for the selected challenge filter (NOT all reviews)
            loadReviews(selectedFilterChallenge ? selectedFilterChallenge : null);

            closeModal("deleteReviewModal");
        } else {
            showToast("Failed to delete review: " + JSON.stringify(response), false);
        }
    }, "DELETE", null, token);
}

//=====================================================================================
// EDIT REVIEW
//=====================================================================================

function openEditModal(event) {
    // Ensure we get the button, even if user clicks the icon inside it
    const button = event.target.closest("button");
    if (!button) {
        showToast("Error: Could not find edit button.", false);
        return;
    }

    const reviewId = button.getAttribute("data-id");
    const currentRating = button.getAttribute("data-rating") || 0;
    const currentReason = button.getAttribute("data-reason") || "";

    if (!reviewId) {
        showToast("Error: Review ID is missing!", false);
        return;
    }

    console.log("Editing Review ID:", reviewId); // Debugging log

    document.getElementById("editReviewId").value = reviewId;
    document.getElementById("editReviewReason").value = currentReason;
    document.getElementById("editReviewAmt").value = currentRating;

    updateStarDisplay(currentRating, "editStarRating");
    showModal("editReviewModal");
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("#editStarRating .star").forEach(star => {
        star.addEventListener("click", function() {
            const value = this.getAttribute("data-value");
            document.getElementById('editReviewAmt').value = value;
            updateStarDisplay(value, "editStarRating");
        });
    });
}); 

function updateReview() {
    const reviewId = document.getElementById("editReviewId").value;
    const newRating = document.getElementById("editReviewAmt").value;
    const newReason = document.getElementById("editReviewReason").value;
    const token = localStorage.getItem("token");

    if (!reviewId || !newRating || newRating < 1 || newRating > 5) {
        showToast("Invalid rating! Must be between 1-5.", false);
        return;
    }

    const data = { review_amt: newRating, reason: newReason };

    fetchMethod(`/api/reviews/${reviewId}`, (status, response) => {
        if (status === 204) {
            showToast("Review updated successfully!");

            // Get the currently selected filter challenge ID
            const selectedFilterChallenge = document.getElementById("challenge_filter").value;

            // Reload reviews for the selected challenge filter (NOT all reviews)
            loadReviews(selectedFilterChallenge ? selectedFilterChallenge : null);

            closeModal("editReviewModal");
        } else {
            showToast("Failed to update review: " + JSON.stringify(response), false);
        }
    }, "PUT", data, token);
}

//=====================================================================================
// EVENT LISTENERS (ON PAGE LOAD)
//=====================================================================================

document.addEventListener("DOMContentLoaded", function () {
    // Star rating selection for add review
    document.querySelectorAll("#addReviewSection .star").forEach(star => {
        star.addEventListener("click", function () {
            const rating = this.getAttribute("data-value");
            document.getElementById("review_amt").value = rating; // Store rating
            updateStarDisplay(rating, "addReviewSection"); // Update star colors
        });
    });

    // Star rating selection for edit review
    document.querySelectorAll("#editStarRating .star").forEach(star => {
        star.addEventListener("click", function () {
            const value = this.getAttribute("data-value");
            document.getElementById("editReviewAmt").value = value;
            updateStarDisplay(value, "editStarRating");
        });
    });
});

//=====================================================================================
// ADD REVIEW FUNCTIONALITY
//=====================================================================================

function addReview() {
    const reviewAmt = document.getElementById("review_amt").value;
    const reason = document.getElementById("reason").value;
    const challengeId = document.getElementById("challenge_id").value;
    const token = localStorage.getItem("token");

    if (!reviewAmt || reviewAmt < 1 || reviewAmt > 5 || !reason || !challengeId) {
        showToast("Please fill all required fields!", false);
        return;
    }

    const data = { review_amt: parseInt(reviewAmt), reason: reason };

    fetchMethod(`/api/reviews/challenges/${challengeId}`, (status, response) => {
        if (status === 201) {
            showToast("Review added successfully!");

            // Get the currently selected challenge from the filter dropdown
            const selectedFilterChallenge = document.getElementById("challenge_filter").value;

            // Reload reviews for the selected challenge filter (NOT all reviews)
            loadReviews(selectedFilterChallenge ? selectedFilterChallenge : null);

            resetReviewForm();
        } else {
            // Handle specific error messages
            let errorMessage;
            if (response?.error === "User has already submitted a review for this challenge") {
                errorMessage = "You can only post one review for a challenge";
            } else if (response?.error === "User has not completed this challenge and cannot submit a review") {
                errorMessage = "You must complete this challenge before submitting a review";
            } else {
                errorMessage = "Failed to add review: " + JSON.stringify(response);
            }

            showToast(errorMessage, false);
        }
    }, "POST", data, token);
}

function resetReviewForm() {
    document.getElementById("review_amt").value = "0";
    document.getElementById("reason").value = "";
    document.getElementById("challenge_id").value = "";
    updateStarDisplay(0, "addReviewSection"); // Reset star display
}

//=====================================================================================
// STAR RATING DISPLAY UPDATE FUNCTION
//=====================================================================================

function updateStarDisplay(rating, containerId) {
    document.querySelectorAll(`#${containerId} .star`).forEach(star => {
        star.style.color = parseInt(star.getAttribute("data-value")) <= parseInt(rating) ? "gold" : "gray";
    });
}

//=====================================================================================
// UTILITIES
//=====================================================================================

function toggleReviewForm() {
    const reviewSection = document.getElementById("addReviewSection");
    reviewSection.style.display = (reviewSection.style.display === "none" || reviewSection.style.display === "") 
        ? "block" 
        : "none";
}

function showToast(message, success = true) {
    const toastElement = document.getElementById("toastNotification");
    const toastMessage = document.getElementById("toastMessage");

    toastMessage.textContent = message;
    toastElement.classList.toggle("text-bg-success", success);
    toastElement.classList.toggle("text-bg-danger", !success);

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

function showModal(modalId) {
    let modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
}

function closeModal(modalId) {
    let modalElement = document.getElementById(modalId);
    let modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) modalInstance.hide();
    
    // Ensure backdrop is removed
    document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
    document.body.classList.remove("modal-open");
}