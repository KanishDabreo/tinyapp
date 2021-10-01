const PORT = 8080;
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { findUserByEmail } = require("./helpers");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

//////////////////              URL DATABASE           /////////////////
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  s9m5xK: {
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  },
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "http://www.artisticperception.ca",
    userID: "aJ48lW"
  }
};
//////////////////            USER DATABASE           /////////////////
const users = {
  user1: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$91pZhj0gErbt8Rucv2.uYOf4DAwlFedwRJg5A7SkhAwqOyT6A4lv2"
  },
  user2: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$91pZhj0gErbt8Rucv2.uYOf4DAwlFedwRJg5A7SkhAwqOyT6A4lv2"
  },
  user3: {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "$2a$10$91pZhj0gErbt8Rucv2.uYOf4DAwlFedwRJg5A7SkhAwqOyT6A4lv2"
  },
};

//////////////////           HELPER FUNCTIONS        /////////////////
const generateRandomString = function() {
  let randomString = Math.random().toString(36).substring(6);
  return randomString;
};

const authenticateUser = (users, email, password) => {
  if (users[email]) {
    //if (userDb[email].password === password) {
    if (bcrypt.compareSync(password, users[email].password)) {
      return {user: users[email], error: null};
    }
    return {username: null, error: 'incorrect password'};
  }
  return {username: null, error: 'incorrect email'};
};

const createUser = function(email, password, users) {
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email,
    password
  };
  console.log(users);
  return userId;
};

const urlsForUser = function(id) {
  let userUrl = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userId === username) {
      userUrl[key] = urlDatabase[key];
    }
  }
  return userUrl;
};

/////////////////  Adding Routes with GET REQUESTS    /////////////////
app.get("/", (req, res) => {
  const id = req.session.user_id;
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

/////////////////            MAINPAGE/INDEX          /////////////////
app.get("/urls", (req, res) => {
  const username = users[req.session.user_id];
  const templateVars = {
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});
/////////////////       URLS_NEW CREATE NEW URL      /////////////////
app.get("/urls/new", (req, res) => {
  const username = users[req.session.user_id];
  const templateVars = {
    username,
  };
  if (!username) {
    return res.render("urls_login", templateVars);
  }
  res.render("urls_new", templateVars);
});
/////////////////             URLS_SHOW              /////////////////
app.get("/urls/:shortURL", (req, res) => {
  const username = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  const templateVars = {
    username,
    shortURL,
    longURL: urlDatabase[shortURL]
  };
  if (!username) {
    return res.render("urls_login", templateVars);
  }
  res.render("urls_show", templateVars);
});

//redirect to longUrl
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  // const longURL = ...
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});
/////////////////           REGISTER GET          /////////////////
app.get("/register", (req, res) => {
  // const username = users[req.session.user_id];
  // const loggedUsername = users[username];
  const templateVars = {
    username: null
  };
  console.log("we registered");
  // if (loggedUsername) {
  //   return res.redirect('/urls');
  // }
  res.render("urls_register", templateVars);
});
/////////////////            LOGIN GET          /////////////////
app.get("/login", (req, res) => {
  const templateVars = {
    username: null
  };
  // display the register form
  res.render('urls_login', templateVars);
});

app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  const username = users[req.session.user_id];
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  console.log(shortURL);
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const username = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  //console.log(shortURL);
  if (!username) {
    return res.render("urls_login", templateVars);
  }
  res.redirect("/urls");
});

//////////////////             DELETE URL          /////////////////
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  console.log(shortURL);
  res.redirect("/urls");
});

//////////////////             EDIT URL          /////////////////
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL];
  console.log(shortURL);
  res.redirect("/urls/show");
});

/////////////////            LOGIN  POST         /////////////////
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // const userFound = findUsersByEmail(users, email);
  const username = authenticateUser(users, email, password);
  if (username) {
    req.session.user_id = username.userId;
    return res.redirect("/urls");
  }
  res.status(400).send('Incorrect password or email');
});

/////////////////            LOGOUT  POST         /////////////////
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});
//res.clearCookie(name [, options])
//res.clearCookie('name', { path: '/admin' })

/////////////////           REGISTER POST         /////////////////
app.post("/register", (req, res) => {
  const email = req.body.email;
  if (!email || !req.body.password) {
    return res.status(400).send('Missing information');
  }
  const userFound = findUserByEmail(email, users);
  if (userFound) {
    res.status(400).send('User already exists');
  }
  const salt = bcrypt.genSaltSync(10);
  const password = bcrypt.hashSync(req.body.password, salt);
  const userId = createUser(email, password, users);
  req.session.user_id = userId;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});