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

function escapeHtml(value)
{
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

exports.sendContactEmail = async (name, email, message) =>
{
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.CONTACT_TO_EMAIL,
        replyTo: email,
        subject: `Website Contact Form - ${name}`,
        text:
`New contact form submission

Name: ${name}
Email: ${email}

Message:
${message}`,
        html:
`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Website Contact Form</title>
</head>
<body style="margin:0; padding:0; background:#0f172a; font-family:Arial, sans-serif; color:#e5e7eb;">
    <div style="max-width:700px; margin:40px auto; background:#111827; border:1px solid #1f2937; border-radius:16px; overflow:hidden;">
        <div style="padding:24px 28px; background:#1e293b; border-bottom:1px solid #334155;">
            <h1 style="margin:0; font-size:24px; color:#ffffff;">New Contact Form Submission</h1>
            <p style="margin:8px 0 0; color:#cbd5e1;">Sent from joeydriedger.ca</p>
        </div>

        <div style="padding:28px;">
            <p style="margin:0 0 16px;"><strong>Name:</strong> ${safeName}</p>
            <p style="margin:0 0 16px;"><strong>Email:</strong> ${safeEmail}</p>

            <div style="margin-top:24px;">
                <p style="margin:0 0 10px;"><strong>Message:</strong></p>
                <div style="padding:18px; background:#0b1220; border:1px solid #1f2937; border-radius:12px; line-height:1.6;">
                    ${safeMessage}
                </div>
            </div>
        </div>
    </div>
</body>
</html>`
    });
};