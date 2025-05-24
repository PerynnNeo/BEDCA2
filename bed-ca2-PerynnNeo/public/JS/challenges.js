document.addEventListener("DOMContentLoaded", function () {
    // Element References
    const challengesContainer = document.getElementById("challengesContainer");
    const challengeFormContainer = document.getElementById("challengeFormContainer");
    const challengeForm = document.getElementById("challengeForm");
    const challengeText = document.getElementById("challengeText");
    const challengeSkillpoints = document.getElementById("challengeSkillpoints");
    const toggleChallengeForm = document.getElementById("toggleChallengeForm");
    const toastMessage = document.getElementById("toastMessage");
    const toastContainer = new bootstrap.Toast(document.getElementById("toastContainer"));
    const deleteModal = new bootstrap.Modal(document.getElementById("deleteChallengeModal"));
    const editModal = new bootstrap.Modal(document.getElementById("editChallengeModal"));
    const completeChallengeModal = new bootstrap.Modal(document.getElementById("completeChallengeModal"));
    
    // Variables for Challenge Completion
    const challengeIdToComplete = document.getElementById("challengeIdToComplete");
    const completionNotes = document.getElementById("completionNotes");
    const confirmCompleteButton = document.getElementById("confirmCompleteButton");
    const completedUsersModal = new bootstrap.Modal(document.getElementById("completedUsersModal"));
    
    // Variables for Editing Challenges
    const editChallengeText = document.getElementById("editChallengeText");
    const editChallengeSkillpoints = document.getElementById("editChallengeSkillpoints");
    const saveEditButton = document.getElementById("saveEditButton");

    // Define API URL & Token
    const currentUrl = window.location.protocol + "//" + window.location.host;
    const token = localStorage.getItem("token");

        let loggedInUserId = null;
        let challengeToDelete = null;
        let challengeToEdit = null;

    /* Fetch logged-in user's ID */
    function fetchUserId(callback) {
        fetchMethod(`${currentUrl}/api/users/me/progress`, (status, response) => {
            if (status === 200 && response.user_id) {
                loggedInUserId = response.user_id;
                callback();
            } else {
                showToast("Failed to fetch user data", false);
            }
        }, "GET", null, token);
    }

    /* Fetch all challenges from the API */
    function fetchChallenges() {
        fetchMethod(`${currentUrl}/api/challenges`, (status, response) => {
            if (status === 200 && Array.isArray(response)) {
                displayChallenges(response);
            } else {
                showToast("Failed to load challenges", false);
            }
        });
    }

    /* Toggle form visibility */
    toggleChallengeForm.addEventListener("click", function () {
        if (challengeFormContainer.classList.contains("d-none")) {
            challengeFormContainer.classList.remove("d-none");
            toggleChallengeForm.textContent = "Close";
        } else {
            challengeFormContainer.classList.add("d-none");
            toggleChallengeForm.textContent = "+ Add Challenge";
        }
    });

    /* Submit new challenge */
    challengeForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const data = {
            challenge: challengeText.value.trim(),
            user_id: "me", // API will resolve the actual user from the token
            skillpoints: parseInt(challengeSkillpoints.value)
        };

        if (!data.challenge || !data.skillpoints) {
            showToast("All fields are required!", false);
            return;
        }

        fetchMethod(`${currentUrl}/api/challenges`, (status, response) => {
            if (status === 201) {
                showToast("Challenge created successfully!");
                challengeForm.reset();
                fetchChallenges(); // Refresh challenges list
            } else {
                showToast(response.message || "Failed to create challenge", false);
            }
        }, "POST", data, token);
    });

    /* Display all challenges dynamically */
    function displayChallenges(challenges) {
        challengesContainer.innerHTML = "";
        challenges.forEach((challenge) => {
            const isCreator = challenge.creator_id === loggedInUserId;

            const card = document.createElement("div");
            card.className = "col-lg-4 col-md-6 col-sm-12";
            card.innerHTML = `
                <div class="card h-100 shadow challenge-card">
                    <div class="card-body text-center">
                        <h5 class="card-title fw-bold">${challenge.challenge}</h5>
                        <p class="card-text"><strong>Skillpoints:</strong> ${challenge.skillpoints}</p>
                        <p class="card-text">Created By: ${challenge.username}</p>

                        ${isCreator ? `
                        <div class="button-container mb-1">
                            <button class="btn btn-sm btn-edit edit-btn" data-id="${challenge.challenge_id}" data-challenge="${challenge.challenge}" data-skillpoints="${challenge.skillpoints}"><i class="bi bi-pencil"></i> <!-- Bootstrap pencil icon --></button>
                            <button class="btn btn-sm btn-delete delete-btn" data-id="${challenge.challenge_id}"><i class="bi bi-trash"></i> <!-- Bootstrap trash icon --></button>
                        
                            </div>` : ""}
                            <button class="btn btn-complete complete-btn" data-id="${challenge.challenge_id}">Complete</button>
                        <button class="btn btn-view view-completed-btn" data-id="${challenge.challenge_id}">View Completed</button>
                    </div>
                </div>
            `;
            challengesContainer.appendChild(card);
        });

        // Attach event listeners for Edit/Delete
        document.querySelectorAll(".edit-btn").forEach((button) => {
            button.addEventListener("click", openEditModal);
        });

        document.querySelectorAll(".delete-btn").forEach((button) => {
            button.addEventListener("click", openDeleteModal);
        });

        document.querySelectorAll(".complete-btn").forEach((button) => {
            button.addEventListener("click", openCompleteModal);
        });

        document.querySelectorAll(".view-completed-btn").forEach((button) => {
            button.addEventListener("click", fetchCompletedUsers);
        });
    }

    /* Open Complete Challenge Modal */
    function openCompleteModal(event) {
        challengeIdToComplete.value = event.target.getAttribute("data-id");
        completionNotes.value = "";
        completeChallengeModal.show();
    }

    /* Confirm Challenge Completion */
    confirmCompleteButton.addEventListener("click", function () {
        const challengeId = challengeIdToComplete.value;
        const notes = completionNotes.value.trim();

        if (!notes) {
            showToast("Please enter some notes before completing the challenge!", false);
            return;
        }

        const data = {
            user_id: loggedInUserId,
            completed: true,
            creation_date: new Date().toISOString().split("T")[0],
            notes: notes
        };

        fetchMethod(`${currentUrl}/api/challenges/${challengeId}`, (status, response) => {
            if (status === 201) {
                showToast("Challenge marked as completed!");
                completeChallengeModal.hide();
                fetchChallenges();
            } else {
                showToast(response.message || "Failed to complete challenge", false);
            }
        }, "POST", data, token);
    });

    /* Fetch users who completed a challenge */
    function fetchCompletedUsers(event) {
        const challengeId = event.target.getAttribute("data-id");

        fetchMethod(`${currentUrl}/api/challenges/${challengeId}`, (status, response) => {
            const completedUsersList = document.getElementById("completedUsersList");
            completedUsersList.innerHTML = "";

            if (status === 200) {
                let users = Array.isArray(response) ? response : [response];

                users.forEach(user => {
                    completedUsersList.innerHTML += `
                        <li class="list-group-item">
                            <strong>${user.username}</strong> - ${user.notes} 
                            <span class="text-muted">(${user.creation_date})</span>
                        </li>`;
                });

                completedUsersModal.show();
            } else {
                showToast("No completions found", false);
            }
        });
    }

    // Show Toast Notification
    function showToast(message, isSuccess = true) {
        toastMessage.textContent = message;
        const toastElement = document.getElementById("toastContainer");
        toastElement.classList.toggle("bg-success", isSuccess);
        toastElement.classList.toggle("bg-danger", !isSuccess);
        toastContainer.show();
    }

    // Open Edit Modal
    function openEditModal(event) {
        challengeToEdit = event.target.getAttribute("data-id");
        editChallengeText.value = event.target.getAttribute("data-challenge");
        editChallengeSkillpoints.value = event.target.getAttribute("data-skillpoints");
        editModal.show();
    }

    // Save Edited Challenge
    saveEditButton.addEventListener("click", function () {
        const updatedChallenge = editChallengeText.value.trim();
        const updatedSkillpoints = parseInt(editChallengeSkillpoints.value.trim());

        if (!updatedChallenge || isNaN(updatedSkillpoints) || updatedSkillpoints < 1 || updatedSkillpoints > 200) {
            showToast("Invalid challenge details!", false);
            return;
        }

        const data = {
            user_id: loggedInUserId,
            challenge: updatedChallenge,
            skillpoints: updatedSkillpoints
        };

        fetchMethod(`${currentUrl}/api/challenges/${challengeToEdit}`, (status, response) => {
            if (status === 200) {
                showToast("Challenge updated successfully!");
                fetchChallenges();
                editModal.hide();
            } else {
                showToast(response.message || "Failed to update challenge", false);
            }
        }, "PUT", data, token);
    });

    // Open Delete Confirmation Modal
    function openDeleteModal(event) {
        challengeToDelete = event.target.getAttribute("data-id");
        deleteModal.show();
    }

    // Confirm & Delete Challenge
    document.getElementById("confirmDeleteButton").addEventListener("click", function () {
        fetchMethod(`${currentUrl}/api/challenges/${challengeToDelete}`, (status) => {
            if (status === 204) {
                showToast("Challenge deleted successfully!");
                fetchChallenges();
                deleteModal.hide();
            } else {
                showToast("Failed to delete challenge", false);
            }
        }, "DELETE", null, token);
    });

    fetchUserId(fetchChallenges);
});
