document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".comment-box form");

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
    
    // Delete functionality
    document.querySelectorAll(".delete-button").forEach(button => {
        button.addEventListener("click", async function () {
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
        });
    });
});
