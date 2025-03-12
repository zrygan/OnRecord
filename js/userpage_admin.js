function confirmation() {
  if (confirm("Are you sure?")) {
    document.getElementById("Option").innerText = "User deleted!";
  }
}

///document.getElementById("acc-options").style.display = "none";
document.addEventListener("DOMContentLoaded", async () => {
  await displayUsers();
});

async function displayUsers() {
  try {
    const response = await fetch("/api/users");
    if (!response.ok) throw new Error("Failed to fetch music data");

    let userData = await response.json();
    

  } catch {
    
  }
}

/*search function*/
function searchUser() {

}
 

/*delete function*/
function deleteUser() {
 
}

