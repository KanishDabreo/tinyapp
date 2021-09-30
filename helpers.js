/////////////////           USER AUTHENTICATION        /////////////////
const bcrypt = require('bcryptjs');

const authenticateUser = (userDb, email, password) => {
  if (userDb[email]) {
    //if (userDb[email].password === password) {
    if (bcrypt.compareSync(password, userDb[email].password)) {
      return {user: userDb[email], error: null};
    }
    return {user: null, error: 'incorrect password'};
  }
  return {user: null, error: 'incorrect email'};
};

module.exports = { authenticateUser };