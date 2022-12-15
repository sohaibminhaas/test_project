const crypto = require("crypto");
const PASSWORD_SALT = process.env.PASSWORD_SALT ?? "";

function passwordToHash(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function RandomCode(){
  return Math.floor(100000 + Math.random() * 900000);
}


module.exports = {
    passwordToHash: passwordToHash,
    RandomCode: RandomCode
}