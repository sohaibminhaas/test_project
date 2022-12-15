const sendGrid = require("@sendgrid/mail");
const sendGridkey = process.env.SENDGRID_API_KEY;
sendGrid.setApiKey(sendGridkey);
module.exports = sendGrid;