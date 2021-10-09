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
    userID: "userRandomID"
  },
  s9m5xK: {
    longURL: "http://www.google.com",
    userID: "userRandomID"
  },
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "user2RandomID"
  },
  i3BoGr: {
    longURL: "http://www.artisticperception.ca",
    userID: "user3RandomID"
  }
};
//////////////////            USER DATABASE           /////////////////
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync('1234', 10)
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$91pZhj0gErbt8Rucv2.uYOf4DAwlFedwRJg5A7SkhAwqOyT6A4lv2"
  },
  user3RandomID: {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "$2a$10$91pZhj0gErbt8Rucv2.uYOf4DAwlFedwRJg5A7SkhAwqOyT6A4lv2"
  },
};

//////////////////           HELPER FUNCTIONS        /////////////////
//generating a string
const generateRandomString = function() {
  let randomString = Math.random().toString(36).substring(6);
  return randomString;
};

//authentication of user by email and password
const authenticateUser = (users, email, password) => {
  for (const elem in users) {
    let currUser = users[elem];
    if (currUser.email === email) {
      if (bcrypt.compareSync(password, currUser.password)) {
        return {user: currUser, error: null};
      }
      return {user: null, error: 'incorrect password'};
    }
  }
  return {user: null, error: 'incorrect email'};
};
//generate a user id as a random string
const createUser = function(email, password, users) {
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email,
    password
  };
  return userId;
};

/////////////////  Adding Routes with GET REQUESTS    /////////////////
app.get("/", (req, res) => {
  const username = users[req.session.user_id];
  const templateVars = {
    username,
  };
  if (!username) {
    return res.render("urls_login", templateVars);
  }
  res.redirect("/urls");
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
    username,
  };
  if (!username) {
    return res.status(400).send('Please Login');
  }
  const ownedUrls = {}; //result of loop
  for (const elem in urlDatabase) {
    let currUrl = urlDatabase[elem];
    if (currUrl.userID === username.id) {
      ownedUrls[elem] = currUrl;
    }
  }
  templateVars.urls = ownedUrls;
  if (!username) {
    return res.render("urls_login", templateVars);
  }
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
/////////////////             URLS_SHOW             /////////////////
app.get("/urls/:shortURL", (req, res) => {
  const username = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  let urlobj = urlDatabase[shortURL];
  const templateVars = {
    username,
    shortURL,
    longURL: urlDatabase[shortURL].longURL
  };
  if (!username) {
    return res.status(400).send('Please Login');
  }
  if (username.id !== urlobj.userID) {
    return res.status(400).send('U dont own dis');
  }
  res.render("urls_show", templateVars);
});
/////////////////         REDIRECT TO longURL       /////////////////
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  if (!longURL) {
    res.status(400).send('Does Not Exist');
  }
  res.redirect(longURL);
});

/////////////////           REGISTER GET          /////////////////
//displays registration page
app.get("/register", (req, res) => {
  const templateVars = {
    username: null
  };
  res.render("urls_register", templateVars);
});

/////////////////             LOGIN GET           /////////////////
//displays login page
app.get("/login", (req, res) => {
  const templateVars = {
    username: null
  };
  res.render('urls_login', templateVars);
});

///////////////////     make new URL(urls_new)    //////////////////
app.post("/urls", (req, res) => {
  const username = users[req.session.user_id];
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = longURL;
  urlDatabase[shortURL].userID = username.id;
  if (!username) {
    res.status(400).send('Must Login');
  }
  res.redirect(`/urls/${shortURL}`);
});

///////////////////      EDIT POST (urls_show)    ///////////////////
//ability to edit url only when user is logged in
app.post("/urls/:shortURL", (req, res) => {
  const username = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  const templateVars = {
    username,
    shortURL,
    longURL
  };
  if (!username) {
    return res.render("urls_login", templateVars);
  }
  res.redirect("/urls");
});

//////////////////            DELETE URL           /////////////////
//deletes url from list on index page
app.post("/urls/:shortURL/delete", (req, res) => {
  const username = users[req.session.user_id];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  delete urlDatabase[shortURL];
  const templateVars = {
    username,
    shortURL,
    longURL
  };
  if (!username) {
    return res.render("urls_login", templateVars);
  }
  res.redirect("/urls");
});

/////////////////             LOGIN  POST          /////////////////
// login action after authentication passes or fails
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const username = authenticateUser(users, email, password);
  if (username.user) {
    req.session.user_id = username.user.id;
    return res.redirect("/urls");
  }
  res.status(400).send('Incorrect password or email');
});

/////////////////             LOGOUT  POST         /////////////////
//logout by closing users data and redirecting to index
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

/////////////////           REGISTER POST         /////////////////
//action when registering. Compares with user database to ensure no duplicates
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