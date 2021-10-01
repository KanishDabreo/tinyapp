/////////////////           USER AUTHENTICATION        /////////////////
const bcrypt = require('bcryptjs');

const authenticateUser = (users, email, password) => {
  if (users[email]) {
    //if (userDb[email].password === password) {
    if (bcrypt.compareSync(password, userDb[email].password)) {
      return {user: users[email], error: null};
    }
    return {username: null, error: 'incorrect password'};
  }
  return {username: null, error: 'incorrect email'};
};

module.exports = { authenticateUser };