document.addEventListener("DOMContentLoaded", async () => {
  // Initialize the UI with edit/delete control panel
  editDel_controlpanel();
  await displayUsers();
});

async function displayUsers() {
  try {
    const response = await fetch("/api/users");
    if (!response.ok) throw new Error("Failed to fetch user data");

    let userData = await response.json();
    console.log("Fetched users:", userData.length);

    // Display users in a table
    const userTable = document.getElementById("user-table");
    if (userTable) {
      const tableBody =
        userTable.querySelector("tbody") ||
        userTable.appendChild(document.createElement("tbody"));
      tableBody.innerHTML = "";

      userData.forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${user.username}</td>
          <td>${user.type}</td>
          <td>${user.email}</td>
          <td>${new Date(user.date_created).toLocaleDateString()}</td>
          <td>
            <button onclick="loadUserDetails('${user.username}')">Edit</button>
            <button onclick="confirmDeleteUser('${user.username}', '${
          user.username
        }')">Delete</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    }
  } catch (error) {
    console.error("Error displaying users:", error);
    alert("Failed to load users. Please try again.");
  }
}

// Edit/Delete Control Panel
function editDel_controlpanel() {
  const controlPanel = document.getElementById("control_panel");
  if (!controlPanel) return;
  
  controlPanel.innerHTML = `
    <h3>Edit or Delete User</h3>
    <form id="searchForm" onsubmit="findUser(); return false;">
      <label for="username">Username:</label>
      <input type="text" id="username" name="username" placeholder="Enter username to find" required />
      <button class="submit_button" type="submit">Find User</button>
    </form>
    <div id="user_not_found" style="display:none;"></div>
    <div id="userDetails" style="display:none;">
      <h3>Edit User Details</h3>
      <form id="editUserForm" onsubmit="updateUser(); return false;">
        <input type="hidden" id="userId" name="userId" />
        <label for="userFirstname">First Name:</label>
        <input type="text" id="userFirstname" name="userFirstname" required />
        <label for="userSurname">Last Name:</label>
        <input type="text" id="userSurname" name="userSurname" required />
        <label for="userEmail">Email:</label>
        <input type="email" id="userEmail" name="userEmail" required />
        <label for="userType">User Type:</label>
        <select id="userType" name="userType" required>
          <option value="normal">Normal</option>
          <option value="artist">Artist</option>
          <option value="admin">Admin</option>
        </select>
        <div class="action-buttons">
          <button id="update-button" class="update-button" type="submit">Update User</button>
          <button id="delete-button" class="delete-button" type="button">Delete User</button>
        </div>
      </form>
    </div>
    
    <h3 style="margin-top: 30px;">All Users</h3>
    <table id="user-table" class="user-table">
      <thead>
        <tr>
          <th>Username</th>
          <th>Type</th>
          <th>Email</th>
          <th>Date Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <!-- User list will be populated here -->
      </tbody>
    </table>
    <div class="pagination" id="pagination">
      <!-- Pagination will be added here if needed -->
    </div>
  `;
}

// When displaying users, add the user-type class for styling
async function displayUsers() {
  try {
    const response = await fetch("/api/users");
    if (!response.ok) throw new Error("Failed to fetch user data");

    let userData = await response.json();
    console.log("Fetched users:", userData.length);

    // Display users in a table
    const userTable = document.getElementById("user-table");
    if (userTable) {
      const tableBody =
        userTable.querySelector("tbody") ||
        userTable.appendChild(document.createElement("tbody"));
      tableBody.innerHTML = "";

      userData.forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${user.username}</td>
          <td><span class="user-type ${user.type}">${user.type}</span></td>
          <td>${user.email}</td>
          <td>${new Date(user.date_created).toLocaleDateString()}</td>
          <td>
            <button onclick="loadUserDetails('${user.username}')">Edit</button>
            <button onclick="confirmDeleteUser('${user.username}')">Delete</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    }
  } catch (error) {
    console.error("Error displaying users:", error);
    alert("Failed to load users. Please try again.");
  }
}

async function findUser() {
  const username = document.getElementById("username").value.trim();
  const userDetails = document.getElementById("userDetails");
  const userNotFound = document.getElementById("user_not_found");
  
  if (!username) {
    userDetails.style.display = "none";
    userNotFound.style.display = "none";
    return;
  }
  
  try {
    const response = await fetch(`/api/admin/user/${encodeURIComponent(username)}`);
    const data = await response.json();
    
    // console.log("API Response: ", data)

    if (response.ok && data.user) {
      populateUserForm(data.user);
      userDetails.style.display = "block";
      userNotFound.style.display = "none";
      
    } else {
      userDetails.style.display = "none";
      userNotFound.style.display = "block";
      userNotFound.innerHTML = `User with username <b>${username}</b> not found.`;
    }
  } catch (error) {
    console.error("Error finding user:", error);
    alert("An error occurred while searching for the user.");
  }
}

// Load user details by username
async function loadUserDetails(username) {
  try {
    const response = await fetch(`/api/admin/user/${username}`);
    const data = await response.json();

    if (response.ok && data.user) {
      populateUserForm(data.user);
      document.getElementById("userDetails").style.display = "block";
      document.getElementById("user_not_found").style.display = "none";

      // Scroll to the edit form
      document
        .getElementById("userDetails")
        .scrollIntoView({ behavior: "smooth" });
    } else {
      alert("User not found or could not be loaded.");
    }
  } catch (error) {
    console.error("Error loading user details:", error);
    alert("An error occurred while loading user details.");
  }
}

// Update user
function populateUserForm(user) {
  // Fill the form with user details
  document.getElementById("username").value = user.username;
  document.getElementById("userFirstname").value = user.firstname;
  document.getElementById("userSurname").value = user.surname;
  document.getElementById("userEmail").value = user.email;
  document.getElementById("userType").value = user.type;

  // Ensure buttons exist and are reassigned correctly each time
  const updateButton = document.getElementById("update-button");
  const deleteButton = document.getElementById("delete-button");

  if (updateButton) {
    updateButton.replaceWith(updateButton.cloneNode(true)); // Remove previous event listeners
    document.getElementById("update-button").onclick = function () {
      console.log("Updating: ", user.username);
      updateUser(user.username);
    };
  }

  if (deleteButton) {
    deleteButton.replaceWith(deleteButton.cloneNode(true)); // Remove previous event listeners
    document.getElementById("delete-button").onclick = function () {
      console.log("Deleting: ", user.username);
      confirmDeleteUser(user.username);
    };
  }

  // Make sure the user details section is visible
  document.getElementById("userDetails").style.display = "block";
  document.getElementById("user_not_found").style.display = "none";
}

// Update user
async function updateUser(username) {
  try {
    // if (!username) { // out of sight, out of mind
    //   alert("No user selected for editing.");
    //   return;
    // }

    // Get updated values from form
    const firstname = document.getElementById("userFirstname").value;
    const surname = document.getElementById("userSurname").value;
    const email = document.getElementById("userEmail").value;
    const type = document.getElementById("userType").value;

    // Create updated user data
    const updatedUser = {
      firstname,
      surname,
      email,
      type
    };

    // Send PUT request to update user
    const response = await fetch(`/api/admin/user/${username}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUser),
    });

    const result = await response.json();

    console.log("Result", result)

    if (response.ok) {
      alert("User updated successfully!");
      // Refresh the user list
      displayUsers();
    } else {
      alert(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error("Error updating user:", error);
    alert("An error occurred while updating the user.");
  }
}

// Confirm before deleting user
function confirmDeleteUser(username) {
  if (
    confirm(
      `Are you sure you want to delete user "${username}"? This action cannot be undone.`
    )
  ) {
    deleteUser(username);
  }
}

// Delete user
// function deleteUserPrompt(username) {
//   const userId = document.getElementById("userId").value;
//   if (!userId) {
//     alert("No user selected for deletion.");
//     return;
//   }

//   if (
//     confirm(
//       "Are you sure you want to delete this user? This action cannot be undone."
//     )
//   ) {
//     deleteUser(username);
//   }
// }

// Perform the actual deletion
async function deleteUser(username) {
  try {
    // Send DELETE request
    const response = await fetch(`/api/admin/user/${username}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("User deleted successfully!");

      // Clear the form if we just deleted the currently displayed user
      const currentUserId = document.getElementById("userId").value;
      if (currentUserId === userId) {
        document.getElementById("username").value = "";
        document.getElementById("userDetails").style.display = "none";
      }

      // Refresh the user list
      displayUsers();
    } else {
      const result = await response.json();
      alert(`Failed to delete user: ${result.error}`);
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    alert("An error occurred while deleting the user.");
  }
}

// Search Function
document.addEventListener("DOMContentLoaded", async () => {
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  let hideResultsTimeout;

  if (!searchInput || !searchResults) {
    console.error("Search elements not found!");
    return;
  }

  // Show search results container when user starts typing
  searchInput.addEventListener("input", async function () {
    const query = searchInput.value.trim();

    // Clear results and hide container if query is empty
    if (query.length === 0) {
      searchResults.innerHTML = "";
      searchResults.style.display = "none";
      return;
    }

    try {
      const response = await fetch(
        `/search?query=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      displaySearchResults(data);

      // Make sure results are visible whenever we have results
      if (data.length > 0) {
        searchResults.style.display = "block";
      } else {
        searchResults.style.display = "none";
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  });

  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission if in a form

      // If there are search results and the first one is visible, navigate to it
      const firstResult = searchResults.querySelector(".search-result-item");
      if (firstResult) {
        firstResult.click();
      }
    }
  });

  searchInput.addEventListener("focus", function () {
    if (searchInput.value.trim().length > 0) {
      searchResults.style.display = "block";
    }
  });

  searchResults.addEventListener("mouseenter", function () {
    clearTimeout(hideResultsTimeout);
  });

  document.addEventListener("click", function (e) {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.display = "none";
    }
  });

  function displaySearchResults(results) {
    searchResults.innerHTML = "";

    if (results.length === 0) {
      searchResults.style.display = "none";
      return;
    }

    searchResults.style.display = "block";

    results.forEach((result) => {
      let resultItem = document.createElement("div");
      resultItem.classList.add("search-result-item");

      if (result.type === "user") {
        resultItem.innerHTML = `<span style="color: grey;">user: </span><span style="color: var(--darkBlue);">${result.username}</span>`;
      } else if (result.type === "music") {
        resultItem.innerHTML = `<span style="color: grey;">song: </span><span style="color: var(--darkBlue);">${result.name}</span>`;
      } else if (result.type === "albumSong") {
        resultItem.innerHTML = `<span style="color: grey;">song: </span><span style="color: var(--darkBlue);">${result.name} (in ${result.album})</span>`;
      } else if (result.type === "artist") {
        resultItem.innerHTML = `<span style="color: var(--orange);">artist: </span><span style="color: var(--darkBlue);">${result.username}</span>`;
      }

      resultItem.addEventListener("click", function () {
        // For both "music" and "albumSong" we route to the review page.
        if (result.type === "user" || result.type === "artist") {
          window.location.href = `/user/${result.username}`;
        } else if (result.type === "albumSong" || result.type === "music") {
          window.location.href = `/review/${result.id}`;
        }
      });

      searchResults.appendChild(resultItem);
    });
  }
});