// OnRecord JavaScript code for the landing page (incl. register and login)
// by Zhean Ganituen (zrygan), January 26, 2025
// Random numbers for the metrics

// REGISTER MODAL
// ref: https://www.w3schools.com/howto/howto_css_modals.asp
var register_modal = document.getElementById("register-modal");
var register_button = document.getElementById("register-button");
var register_close = document.getElementById("close-register-modal");

register_button.onclick = function () {
  register_modal.style.display = "block";
};

register_close.onclick = function () {
  register_modal.style.display = "none";
};

/* closes modal when clicked outside of bounds */
window.onclick = function (event) {
  if (event.target == register_modal) {
    register_modal.style.display = "none";
  }
};

/* form for registering a new user */
const err_register = document.getElementById("error_register");
const register_form = document.getElementById("register-form");
register_form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const user_data = new FormData(register_form);
  let user_object = {};
  user_data.forEach((value, key) => {
    user_object[key] = value;
  });

  // Check username and email uniqueness
  try {
    const response = await fetch("/register/check-availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user_object.username,
        email: user_object.email,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log("Username and Email available:", data);
    } else {
      console.error(data.error);
      err_register.textContent =
        data.error || "Username or Email already taken, please choose another.";
      return;
    }
  } catch (error) {
    console.error("Error connecting to register endpoint:", error);
    err_register.textContent = "Error connecting to server. Please try again.";
    return;
  }

  // Check if user entered email instead of username
  if (user_object.username.includes("@")) {
    err_register.textContent = "Input your username not your email.";
    document.getElementById("username").focus();
    return;
  }

  // Password validation
  if (user_object.password.length < 6) {
    err_register.textContent = "Password must be at least 6 characters.";
    return;
  }

  const passwordRegex = /^[A-Za-z0-9._$%^*!]+$/;
  if (!passwordRegex.test(user_object.password)) {
    err_register.textContent =
      "Error: password can contain only letters, numbers, and the symbols: . _ $ % ^ * !";
    document.getElementById("password").value = "";
    return;
  }

  // Birthday validation
  const today = new Date();
  const birthDate = new Date(user_object.birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  if (age < 12) {
    err_register.textContent = "You must be at least 12 years old to register.";
    return;
  }

  // Split fullname -> firstname/s + surname
  const nameParts = user_object.fullname.trim().split(/\s+/);
  const surname = nameParts.pop();
  const firstname = nameParts.join(" ");

  // Prepare data for server
  const userData = {
    surname: surname,
    firstname: firstname,
    username: user_object.username,
    email: user_object.email,
    password: user_object.password,
    birthday: user_object.birthday,
  };

  try {
    const response = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (response.ok) {
      console.log("Registration successful");
      window.location.href = "/home";
    } else {
      console.error("Registration failed", data.error);
      err_register.textContent = data.error || "Registration failed";
    }
  } catch (error) {
    console.error("Error connecting to register endpoint:", error);
    err_register.textContent = "Error connecting to server. Please try again.";
  }
});

// LOGIN MODAL
var login_modal = document.getElementById("login-modal");
var login_button = document.getElementById("login-button");
var login_close = document.getElementById("close-login-modal");

login_button.onclick = function () {
  login_modal.style.display = "block";
};

login_close.onclick = function () {
  login_modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == login_modal) {
    login_modal.style.display = "none";
  }
};

const err_login = document.getElementById("error_login");
const login_form = document.getElementById("login-form");

login_form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const user_data = new FormData(login_form);
  let user_object = {};
  user_data.forEach((value, key) => {
    user_object[key] = value;
  });

  const username = user_object.username;
  const password = user_object.password;

  // Check if user entered email instead of username
  if (username.includes("@")) {
    err_login.textContent = "Input your username not your email.";
    document.getElementById("username").focus();
    return;
  }

  if (password.length < 6) {
    err_login.textContent = "Error: password must be at least 6 characters";
    document.getElementById("password").value = "";
    return;
  }

  const passwordRegex = /^[A-Za-z0-9._$%^*!]+$/;
  if (!passwordRegex.test(password)) {
    err_login.textContent =
      "Error: password can contain only letters, numbers, and the symbols: . _ $ % ^ * !";
    document.getElementById("password").value = "";
    return;
  }

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log("Login successful:", data);
      window.location.href = "/home"; // Use absolute path
    } else {
      err_login.textContent = data.error || "Login failed";
      document.getElementById("password").value = "";
    }
  } catch (error) {
    console.error("Error connecting to login endpoint:", error);
    err_login.textContent = "Login error, please try again.";
  }
});

// HOVERBOX and METRICS

// FIXME:   Once the back end is here, change this to the actual
//          numbers in the database
let num_users = 0;
let num_artists = 0;
let num_tracks = 0;
let num_albums = 0;

let span_num_users = document.getElementById("num_users");
let span_num_artists = document.getElementById("num_artists");
let span_num_tracks = document.getElementById("num_tracks");
let span_num_albums = document.getElementById("num_albums");

function updateDisplay() {
  span_num_users.innerHTML = num_users;
  span_num_artists.innerHTML = num_artists;
  span_num_tracks.innerHTML = num_tracks;
  span_num_albums.innerHTML = num_albums;
}

async function updateCounts() {
  try {
    const response = await fetch("/api/metrics");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    num_users = data.users;
    num_artists = data.artists;
    num_tracks = data.tracks;
    num_albums = data.albums;

    updateDisplay();
  } catch (error) {
    console.error("Error fetching metrics:", error);
    // Optionally, display an error message to the user
    // span_num_users.innerHTML = "Error";
    // span_num_artists.innerHTML = "Error";
    // span_num_tracks.innerHTML = "Error";
    // span_num_albums.innerHTML = "Error";
  }
}

// Initial fetch
updateCounts();

// Periodic updates (e.g., every 5 seconds)
setInterval(updateCounts, 5000);

function hoverbox_on() {
  document.getElementById("hoverbox").innerHTML = `
        Click to learn more about the <br>
        Developers 🤖 of OnRecord!
    `;
}

function hoverbox_off() {
  document.getElementById("hoverbox").innerHTML = `
        People on the record: <span>${num_users}</span> <br />
        Artists on the record: <span>${num_artists}</span> <br />
        Tracks on the record: <span>${num_tracks}</span><br />
        Albums on the record: <span>${num_albums}</span><br />
    `;
}

const hoverbox = document.getElementById("hoverbox");
hoverbox.addEventListener("mouseover", hoverbox_on);
hoverbox.addEventListener("mouseout", hoverbox_off);
