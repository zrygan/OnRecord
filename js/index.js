// Random numbers for the metrics
// FIXME:   Once the back end is here, change this to the actual
//          numbers in the database
let num_users =     Math.floor(Math.random()*1000);
let num_artists =   Math.floor(Math.random()*1000);
let num_tracks =    Math.floor(Math.random()*1000);
let num_albums =    Math.floor(Math.random()*1000);

let span_num_users = document.getElementById("num_users");
let span_num_artists = document.getElementById("num_artists");
let span_num_tracks = document.getElementById("num_tracks");
let span_num_albums = document.getElementById("num_albums");

span_num_users.innerHTML = num_users;
span_num_artists.innerHTML = num_artists;
span_num_tracks.innerHTML = num_tracks;
span_num_albums.innerHTML = num_albums;