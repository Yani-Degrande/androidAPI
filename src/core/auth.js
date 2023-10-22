const bcrypt = require("bcryptjs");

const checkPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const checkToken = async (token, hashedToken) => {
  return await bcrypt.compare(token, hashedToken);
};

module.exports = {
  checkPassword,
  checkToken,
};
