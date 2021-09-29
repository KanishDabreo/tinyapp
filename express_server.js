const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
//const cookieParser = require('cookie-parser'); 
//call later with _>> app.use(cookieParser())
app.set("view engine", "ejs");
//below added after "npm install body-parser" in terminal
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//string generator for short url
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
//database of urls
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "6an4dK": "http://www.artisticperception.ca"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Adding Routes with GET requests
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Sending HTML
//making a get request
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//mainpage
app.get("/urls", (req, res) => {
  //res.send("<html><body>Hello <b>Urls</b></body></html>\n");
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  console.log(shortURL)
  
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);
  res.redirect("/urls");         // Respond with 'Ok' (replaced with redirect to homepage)
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  // const longURL = ...
  const longURL = urlDatabase[shortURL]
  res.redirect(longURL);
});

//to delete url on main page
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  //delete operator
  delete urlDatabase[shortURL]
  console.log(shortURL);
  res.redirect("/urls");
});

//to lead to edit prompt from main page
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL]
  console.log(shortURL);
  res.redirect("/urls/show");
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL]
  console.log(shortURL);
  res.redirect("/urls");
});