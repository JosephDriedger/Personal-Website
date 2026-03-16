const express = require("express");
const rateLimit = require("express-rate-limit");
const contactController = require("../controllers/contactController");

const router = express.Router();

const contactFormLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "development" ? 100 : 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (req, res) =>
    {
        const payload = {
            ok: false,
            errors: {
                general: "Too many contact attempts. Please wait a bit and try again."
            }
        };

        if (req.xhr || req.get("Accept") === "application/json")
        {
            return res.status(429).json(payload);
        }

        return res.status(429).render("pages/contact", {
            errors: payload.errors,
            form: {
                name: (req.body && req.body.name) || "",
                email: (req.body && req.body.email) || "",
                message: (req.body && req.body.message) || ""
            },
            success: null,
            recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY
        });
    }
});

router.get("/contact", contactController.showContactPage);
router.post("/contact", contactFormLimiter, contactController.submitContact);

module.exports = router;