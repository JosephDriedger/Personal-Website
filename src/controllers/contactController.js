const contactService = require("../services/contactService");

function isAjaxRequest(req)
{
    return req.xhr || req.get("Accept") === "application/json";
}

async function verifyRecaptcha(token, remoteIp)
{
    if (!token)
    {
        return false;
    }

    const params = new URLSearchParams();
    params.append("secret", process.env.RECAPTCHA_SECRET_KEY);
    params.append("response", token);

    if (remoteIp)
    {
        params.append("remoteip", remoteIp);
    }

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
    });

    const data = await response.json();
    return Boolean(data.success);
}

function renderErrorResponse(req, res, statusCode, errors, form = {}, success = null)
{
    if (isAjaxRequest(req))
    {
        return res.status(statusCode).json({
            ok: false,
            errors,
            form,
            success
        });
    }

    return res.status(statusCode).render("pages/contact", {
        errors,
        form,
        success,
        recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY
    });
}

function renderSuccessResponse(req, res, message)
{
    if (isAjaxRequest(req))
    {
        return res.status(200).json({
            ok: true,
            message
        });
    }

    return res.render("pages/contact", {
        errors: {},
        form: {},
        success: message,
        recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY
    });
}

exports.showContactPage = (req, res) =>
{
    res.render("pages/contact", {
        errors: {},
        form: {},
        success: null,
        recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY
    });
};

exports.submitContact = async (req, res) =>
{
    const {
        name,
        email,
        message,
        website = "",
        "g-recaptcha-response": recaptchaToken
    } = req.body;

    const trimmedName = (name || "").trim();
    const trimmedEmail = (email || "").trim();
    const trimmedMessage = (message || "").trim();

    const errors = {};

    if (website.trim() !== "")
    {
        return renderSuccessResponse(req, res, "Your message has been sent successfully.");
    }

    if (!trimmedName)
    {
        errors.name = "Name is required.";
    }

    if (!trimmedEmail)
    {
        errors.email = "Email is required.";
    }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail))
    {
        errors.email = "Enter a valid email address.";
    }

    if (!trimmedMessage)
    {
        errors.message = "Message is required.";
    }
    else if (trimmedMessage.length < 10)
    {
        errors.message = "Message must be at least 10 characters.";
    }

    if (Object.keys(errors).length > 0)
    {
        return renderErrorResponse(req, res, 400, errors, {
            name: trimmedName,
            email: trimmedEmail,
            message: trimmedMessage
        });
    }

    try
    {
        const recaptchaPassed = await verifyRecaptcha(recaptchaToken, req.ip);

        if (!recaptchaPassed)
        {
            return renderErrorResponse(req, res, 400, {
                general: "reCAPTCHA verification failed. Please try again."
            }, {
                name: trimmedName,
                email: trimmedEmail,
                message: trimmedMessage
            });
        }

        await contactService.sendContactEmail(trimmedName, trimmedEmail, trimmedMessage);

        return renderSuccessResponse(req, res, "Your message has been sent successfully.");
    }
    catch (error)
    {
        console.error(error);

        return renderErrorResponse(req, res, 500, {
            general: "Failed to send message. Please try again later."
        }, {
            name: trimmedName,
            email: trimmedEmail,
            message: trimmedMessage
        });
    }
};