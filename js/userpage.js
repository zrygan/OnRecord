document.addEventListener("DOMContentLoaded", async () => {
    await loadUser();
  });
  
  async function loadUser() {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch music data");
  
      let userData = await response.json();
      
  
    } catch {
      
    }
  }

  async function getCurrentUsername() {
    try {
      const response = await fetch("/api/current-username");
      if (!response.ok) {
        throw new Error("Failed to fetch current username");
      }
      const data = await response.json();
      return data.username;
    } catch (error) {
      console.error("Error fetching current username:", error);
      return null;
    }
  }