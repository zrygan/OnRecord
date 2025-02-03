// OnRecord JavaScript code for the landing page (incl. register and login)
// by Zhean Ganituen (zrygan), January 26, 2025
// Random numbers for the metrics

// FIXME:   Once the back end is here, change this to the actual
//          numbers in the database
let num_users = Math.floor(Math.random() * 1000);
let num_artists = Math.floor(Math.random() * 1000);
let num_tracks = Math.floor(Math.random() * 1000);
let num_albums = Math.floor(Math.random() * 1000);

let span_num_users = document.getElementById("num_users");
let span_num_artists = document.getElementById("num_artists");
let span_num_tracks = document.getElementById("num_tracks");
let span_num_albums = document.getElementById("num_albums");

span_num_users.innerHTML = num_users;
span_num_artists.innerHTML = num_artists;
span_num_tracks.innerHTML = num_tracks;
span_num_albums.innerHTML = num_albums;

// REGISTER MODAL
// ref: https://www.w3schools.com/howto/howto_css_modals.asp
var register_modal = document.getElementById("register-modal");
var register_button = document.getElementById("register-button");
var register_close = document.getElementById("close-register-modal");

register_button.onclick = function() {
    register_modal.style.display = "block";
}

register_close.onclick = function() {
    register_modal.style.display = "none";
}

/* closes modal when clicked outside of bounds */
window.onclick = function(event) {
    if (event.target == register_modal) {
        register_modal.style.display = "none";
    }
}

/* form for registering a new user */
const register_form = document.getElementById("register-form");
register_form.addEventListener('submit', function(event) {
    event.preventDefault();

    const user_data = new FormData(register_form);
    let user_object = {};
    user_data.forEach((value, key) => {
        user_object[key] = value;
    });

    // birthday validation
    // (user must be at least 12 years old)
    const today = new Date();
    const birthDate = new Date(user_object.birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    if (age < 12) {
        alert("You must be at least 12 years old to register.");
        return;
    }

    // splitting fullname -> firstname/s + surname
    const nameParts = user_object.fullname.trim().split(/\s+/);
    const surname = nameParts.pop();
    const firstname = nameParts.join(' ');

    // store the user data in local storage
    const user_info = {
        surname: surname,
        firstname: firstname,
        username: user_object.username,
        email: user_object.email,
        password: user_object.password,
        birthday: user_object.birthday
    };
    localStorage.setItem('user_data', JSON.stringify(user_info));

    console.log('User data stored:', user_info);

    register_modal.style.display = "none";

    window.location.replace("./pages/home.html");

});

/* form for logging in */
const login_form = document.getElementById("login-form");
login_form.addEventListener('submit', function(event) {
    event.preventDefault();

    const user_data = new FormData(login_form);
    let user_object = {};
    user_data.forEach((value, key) => {
        user_object[key] = value;
    });

    // retrieve the user data from local storage
    // TODO when the backend is here

    login_modal.style.display = "none"; 

    //
    window.location.replace("./pages/home.html");
});

// LOGIN MODAL
var login_modal = document.getElementById("login-modal");
var login_button = document.getElementById("login-button");
var login_close = document.getElementById("close-login-modal");

login_button.onclick = function() {
    login_modal.style.display = "block";
}

login_close.onclick = function() {
    login_modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == login_modal) {
        login_modal.style.display = "none";
    }
}

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
