const contactService = require("../services/contactService");

exports.submitContact = async (req, res) =>
{
  const { name, email, message } = req.body;

  const errors = {};

  if (!name || name.trim() === "")
  {
    errors.name = "Name is required";
  }

  if (!email || email.trim() === "")
  {
    errors.email = "Email is required";
  }

  if (!message || message.trim() === "")
  {
    errors.message = "Message is required";
  }

  if (Object.keys(errors).length > 0)
  {
    return res.render("pages/contact", {
      errors,
      form: { name, email, message },
      success: null
    });
  }

  try
  {
    await contactService.sendContactEmail(name, email, message);

    res.render("pages/contact", {
      errors: {},
      form: {},
      success: "Your message has been sent successfully."
    });
  }
  catch (error)
  {
    console.error(error);

    res.render("pages/contact", {
      errors: { general: "Failed to send message. Please try again later." },
      form: { name, email, message },
      success: null
    });
  }
};