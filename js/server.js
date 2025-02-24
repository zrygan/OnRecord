const express = require("express");
const session = require("express-session");
const loginRoute = require("./login");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "__", // FIXME: what the fuck is this supposed to be?
    resave: false,
    saveUninitialized: true,
  })
);

// Mount the login router
app.use("/", loginRoute);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
