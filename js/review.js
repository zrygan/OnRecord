document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".comment-box form");

    const delete_function = async function () {
        const reviewId = this.getAttribute("data-review-id");
        console.log("DELETE");
        if (confirm("Are you sure you want to delete this review?")) {
            try {
                const response = await fetch(`/delete-review/${reviewId}`, {
                    method: "DELETE"
                });

                const result = await response.json();
                
                if (response.ok) {
                    location.reload(); // Refresh the page to reflect the deletion
                } else {
                    alert("Error: " + result.error);
                }
            } catch (error) {
                console.error("Error deleting review:", error);
                alert("Failed to delete review. Please try again later.");
            }
        }
    };

    const edit_function = function () {
        const reviewId = this.getAttribute("data-review-id");
        const reviewContainer = this.closest(".user-review");
        const reviewTextElement = reviewContainer.querySelector(".user-review-details p:nth-of-type(1)"); // Only edit the comment
        const reviewRatingElement = reviewContainer.querySelector(".user-review-details p:nth-of-type(2)"); // Rating display
    
        if (!reviewTextElement || reviewContainer.querySelector(".edit-textarea")) return; // Prevent multiple edits
    
        // Get the current text and rating
        const currentText = reviewTextElement.textContent.trim();
        const currentRating = parseInt(reviewRatingElement.textContent.match(/\d+/)[0], 10);
    
        // Replace text with a textarea
        const textarea = document.createElement("textarea");
        textarea.value = currentText;
        textarea.classList.add("edit-textarea");
        reviewTextElement.replaceWith(textarea);
    
        // Create a star rating input
        const ratingContainer = document.createElement("div");
        ratingContainer.classList.add("rate");
        for (let i = 5; i >= 1; i--) {
            const input = document.createElement("input");
            input.type = "radio";
            input.id = `star${i}-edit-${reviewId}`;
            input.name = `rate-edit-${reviewId}`;
            input.value = i;
            if (i === currentRating) input.checked = true;
    
            const label = document.createElement("label");
            label.htmlFor = `star${i}-edit-${reviewId}`;
            label.textContent = i;
    
            ratingContainer.appendChild(input);
            ratingContainer.appendChild(label);
        }
        reviewRatingElement.replaceWith(ratingContainer);
    
        // Create save and cancel buttons
        const saveButton = document.createElement("button");
        saveButton.textContent = "Save";
        saveButton.classList.add("save-button");
    
        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.classList.add("cancel-button");
    
        // Remove existing buttons
        const actionsContainer = reviewContainer.querySelector(".review-actions");
        actionsContainer.innerHTML = ""; // Clears existing buttons
    
        // Append new buttons
        actionsContainer.appendChild(cancelButton);
        actionsContainer.appendChild(saveButton);
    
        // Handle save button click
        saveButton.addEventListener("click", async function () {
            const newReviewText = textarea.value.trim();
            const newRating = parseInt(document.querySelector(`input[name='rate-edit-${reviewId}']:checked`)?.value, 10) || currentRating;
    
            if (newReviewText) {
                try {
                    const response = await fetch(`/edit-review/${reviewId}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ comment: newReviewText, rating: newRating })
                    });
    
                    const result = await response.json();
    
                    if (response.ok) {
                        // Replace textarea with updated text
                        const newTextElement = document.createElement("p");
                        newTextElement.textContent = newReviewText;
                        textarea.replaceWith(newTextElement);
    
                        // Replace rating input with updated rating text
                        const newRatingElement = document.createElement("p");
                        newRatingElement.textContent = `Rating: ${newRating}/5`;
                        ratingContainer.replaceWith(newRatingElement);
    
                        // Restore edit and delete buttons
                        restoreActionButtons(actionsContainer, reviewId);
                    } else {
                        alert("Error: " + result.error);
                    }
                } catch (error) {
                    console.error("Error updating review:", error);
                    alert("Failed to update review. Please try again later.");
                }
            }
        });
    
        // Handle cancel button click
        cancelButton.addEventListener("click", function () {
            // Restore original text and rating
            textarea.replaceWith(reviewTextElement);
            ratingContainer.replaceWith(reviewRatingElement);
            restoreActionButtons(actionsContainer, reviewId);
        });
    };

    
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        console.log("SUBMIT");
        try {
            const response = await fetch("/submit-review", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (response.ok) {
                location.reload(); // Refresh the page to show the new review
            } else {
                alert("Error: " + result.error);
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Failed to submit review. Please try again later.");
        }
    });

    document.querySelectorAll(".edit-button").forEach(button => {
        button.addEventListener("click", edit_function);
    });
    

    function restoreActionButtons(actionsContainer, reviewId) {
        actionsContainer.innerHTML = `
            <button class="edit-button" data-review-id="${reviewId}">Edit</button>
            <button class="delete-button" data-review-id="${reviewId}">Delete</button>
        `;
    
        // Select the newly created Edit button
        const newEditButton = actionsContainer.querySelector(".edit-button");
        const newDeleteButton = actionsContainer.querySelector(".delete-button");
    
        // Reattach event listener for edit functionality
        newEditButton.addEventListener("click", edit_function);
    
        // Reattach event listener for delete functionality
        newDeleteButton.addEventListener("click", delete_function);
    }
    
    // Delete functionality
    document.querySelectorAll(".delete-button").forEach(button => {
        button.addEventListener("click", delete_function);
    });
});
