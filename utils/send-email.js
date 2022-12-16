const sendGrid = require("../utils/send-grid-config");

async function sendEmail(code, email, type, id) {
    try {
        if (code) {
            const body =`<!DOCTYPE html>
                        <html lang="en">
                            <body style=" max-width: 1020px; margin: 0 auto;">
                                <div> <span>Hello There</span> </div>
                                <div> <span>Here is your temporary sign in link with password</span> </div>
                                <div> <span>Please visit the link to reset your password</span> </div>
                                <div> <span><a href="${process.env.BASEURL}/temporary/signin/${id}"><b>Please Click Here</b></a></span> </div>
                                <div> <span>Code <b> ${code}</b></span> </div>
                            </body>
                        </html>`
            let msg = {
                to: email,
                from: process.env.SENDGRID_FROM_EMAIL,
                subject: `New ${type} Temporary Signin`,
                html: body
            };
            console.log("msg:", msg)
            const emailSerRes = await sendGrid.send(msg);
            console.log("Send Email Response", emailSerRes);
        }
    } catch (error) {
        console.error("error in sending emails", error);
    }
}


module.exports = {
    sendEmail: sendEmail
}