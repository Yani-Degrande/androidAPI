const bcrypt = require('bcryptjs');

const checkPassword = (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};



module.exports = {
    checkPassword,
};
