const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

exports.sendContactEmail = async (name, email, message) =>
{
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: process.env.CONTACT_TO_EMAIL,
    replyTo: email,
    subject: `Website Contact Form - ${name}`,
    text:
`New contact form submission

Name: ${name}
Email: ${email}

Message:
${message}`
  };

  await transporter.sendMail(mailOptions);
};