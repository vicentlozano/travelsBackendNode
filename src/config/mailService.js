const nodemailer = require("nodemailer");

const userMail = process.env.MAIL_USER;
const host = process.env.MAIL_HOST;
const pass = process.env.MAIL_PASS;

const transporter = nodemailer.createTransport({
  host: host,
  auth: {
    user: userMail,
    pass: pass,
  },
  pool: true,
});

module.exports = {
  sendMail: (
    receivers,
    subject,
    msg,
    cc = undefined,
    replyTo = undefined,
    fromName = "validate email travel app",
    attachments = undefined
  ) => {
    const options = {
      from: {
        name: fromName,
        address: userMail,
      },
      to: receivers,
      subject: subject,
      html: msg,
      cc,
      replyTo,
      attachments,
    };

    transporter.sendMail(options, (err) => {
      if (err) console.error(err);
    });
  },
};
