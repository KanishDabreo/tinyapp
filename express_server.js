const PORT = 8080; // default port 8080
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const { authenticateUser } = require("./helpers");

/////////////////  VIEW ENGINE SETUP   /////////////////
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.use((req, res, next) => {
  const email = req.session.email;
  if (!email) {
    return res.redirect('/urls');
  }
  next();
});
//////////////////string generator for short url///////////////
const generateRandomString = function() {
  let randomString = Math.random().toString(36).substring(6);
  return randomString;

  // let newNum = '';
  // const sample = 'abcdefghijklmnopqrstuvwxyz123456789'.split('');

  // for (let i = 0; i < 6; i++) {
  //   const randomIndex = Math.floor(Math.random() * sample.length);
  //   newNum =+ randomIndex;
  //   console.log('this randomIndex:', randomIndex);
  // }
  // //const blank = Math.random().toString(36).substring(2, 8);  alternative from lecture
  // return newNum;
};
//////////////////       Url database      /////////////////
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "6an4dK": "http://www.artisticperception.ca"
};

//////////////////       Users database      /////////////////
const hashedPassword1 = bcrypt.hashSync("purple-monkey-dinosaur", salt);
const hashedPassword2 = bcrypt.hashSync("dishwasher-funk", salt);
const hashedPassword3 = bcrypt.hashSync("dishwasher-funk3", salt);

const user = {
    name: "userRandomID",
    email: "user@example.com",
    password: hashedPassword1,
    secret: ""
  };
  const user2 = {
    name: "user2RandomID",
    email: "user2@example.com",
    password: hashedPassword2,
    secret: ""
  };
  const user3 = {
    name: "user3RandomID",
    email: "user3@example.com",
    password: hashedPassword3,
    secret: ""
};

const userDatabase = {
  "user@example.com": user,
  "user2@example.com": user2,
  "user3@example.com": user3,
};

const findUserByEmail = function(email, users) {
  for (let userId in users) {
    const user = users[userId];
    if (email === user.email) {
      return user;
    }
  }
  return false;
};

const newUser = function (name, email, password, users) {
  // Create a user id ... generate a unique id
  const user_id = generateRandomString();
  const user = {
    id: user_id,
    email: req.body.email,
    password: req.body.password
  };
  user[user_id] = user;
  return user_id;
  req.session.user_id = user_id;
};

app.get("/", (req, res) => {
  const username = req.session.username;
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

/////////////////  Adding Routes with GET REQUESTS    /////////////////
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Sending HTML
//making a get request
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

/////////////////            MAINPAGE/INDEX          /////////////////
app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.session["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  console.log(shortURL);

  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);
  res.redirect("/urls");         // Respond with 'Ok' (replaced with redirect to homepage)
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.session["username"]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    username: req.session["username"],
    shortURL: shortURL,
    longURL: urlDatabase[shortURL]
  };
  res.render("urls_show", templateVars);
});

//redirect to longUrl
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  // const longURL = ...
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//to delete url on main page
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  //delete operator
  delete urlDatabase[shortURL];
  console.log(shortURL);
  res.redirect("/urls");
});

//to lead to edit prompt from main page
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL];
  console.log(shortURL);
  res.redirect("/urls/show");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  //console.log(shortURL);
  res.redirect("/urls");
});

/////////////////            LOGIN           /////////////////
app.get("/login", (req, res) => {
  const templateVars = {
    username: req.session["username"],
    password: req.session["password"],
  };
  // display the register form
  res.render('login', templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const result = authenticateUser(userDatabase, email, password)
  if(result.error) {
    console.log(result.error);
    return res.redirect("/urls");
  }
  res.session("email", email);
  return res.redirect("/vault");
});
// res.status(400).send('Incorrect password or email');

/////////////////            LOGOUT           /////////////////
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});
//res.clearCookie(name [, options])
//res.clearCookie('name', { path: '/admin' })


/////////////////           REGISTER           /////////////////
app.get("/register", (req, res) => {
  const templateVars = {
    username: req.session["username"]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const name = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const User = findUserByEmail(email, users);
  if (email === "" || password === "") {
    res.status(400).send('Enter required information');
  }
  if (findUserByEmail(email, name)) {
    return res.status(400).send('User already exists');
  }
  if (!email || !password) {
    return res.status(400).send('Incorrect information');
  }
  const newUser = function (name, email, password, users) {
    // Create a user id ... generate a unique id
    const user_id = generateRandomString();
    const user = {
      id: user_id,
      email: req.body.email,
      password: req.body.password
    };
    user[user_id] = user;
    return user_id;
    req.session.user_id = user_id;
  };
  res.session('user_id', userID);
  res.redirect('/urls');
});


app.get("/vault", (req, res) => {
  const email = req.session.email;

  const templateVars = {
  name: userDatabase[email].name,
  secret: userDatabase[email].secret,
  };
  res.render("vault", templateVars);
});