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

// Close the modal if the user clicks anywhere outside of it
window.onclick = function(event) {
    if (event.target == register_modal) {
        register_modal.style.display = "none";
    }
}

const register_form = document.getElementById("register-form");
register_form.addEventListener('submit', function(event) {
    event.preventDefault();

    const user_data = new FormData(register_form);
    let user_object = {};
    user_data.forEach((value, key) => {
        user_object[key] = value;
    });

    // Validate birthday (user must be at least 12 years old)
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

    const nameParts = user_object.fullname.trim().split(/\s+/);
    const surname = nameParts.pop();
    const firstname = nameParts.join(' ');

    // Store the user data in local storage
    const user_info = {
        surname: surname,
        firstname: firstname,
        username: user_object.username,
        email: user_object.email,
        password: user_object.password,
        birthday: user_object.birthday
    };
    localStorage.setItem('user_data', JSON.stringify(user_info));

    // Optionally, you can log the user data to the console
    console.log('User data stored:', user_info);

    // Close the modal after submission
    register_modal.style.display = "none";
});
