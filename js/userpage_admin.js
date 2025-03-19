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
// Edit/Delete Control Panel
function editDel_controlpanel() {
  const controlPanel = document.getElementById("control_panel");
  if (!controlPanel) return;
  
  controlPanel.innerHTML = `
    <h3>Edit or Delete User</h3>
    <form id="searchForm" onsubmit="findUser(); return false;">
      <label for="username">Username:</label>
      <input
        type="text"
        id="username"
        name="username"
        placeholder="Enter username to find"
        required
      />
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
          <button class="update-button" type="submit" onclick="updateUser()">Update User</button>
          <button class="delete-button" type="button" onclick="confirmDeleteUser()">Delete User</button>
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

// Find user by username
async function findUser() {
  const username = document.getElementById("username").value;
  const userDetails = document.getElementById("userDetails");
  const userNotFound = document.getElementById("user_not_found");

  if (!username.trim()) {
    userDetails.style.display = "none";
    userNotFound.style.display = "none";
    return;
  }

  try {
    // Note: This API endpoint needs to be added to your server.js
    const response = await fetch(
      `/api/admin/user/${encodeURIComponent(username)}`
    );
    const data = await response.json();

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

// Load user details by ID (used from the table)
async function loadUserDetails(userId) {
  try {
    const response = await fetch(`/api/admin/user/${userId}`);
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

// Populate user form with data
function populateUserForm(user) {
  document.getElementById("userId").value = user._id;
  document.getElementById("username").value = user.username;
  document.getElementById("userFirstname").value = user.firstname;
  document.getElementById("userSurname").value = user.surname;
  document.getElementById("userEmail").value = user.email;
  document.getElementById("userType").value = user.type;
}

// Update user
async function updateUser(username) {
  try {
    const userId = document.getElementById("userId").value;
    if (!userId) {
      alert("No user selected for editing.");
      return;
    }

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
      type,
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

    if (response.ok) {
      alert("User updated successfully!");
      // Refresh the user list
      displayUsers();
    } else {
      alert(`Failed to update user: ${result.error}`);
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
