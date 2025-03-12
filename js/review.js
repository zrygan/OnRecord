document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".comment-box form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

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
});
