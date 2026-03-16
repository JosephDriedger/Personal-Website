document.addEventListener("DOMContentLoaded", () =>
{
    const form = document.querySelector("[data-contact-form]");
    const feedback = document.querySelector("[data-form-feedback]");
    const submitButton = form ? form.querySelector('button[type="submit"]') : null;
    const buttonLabel = submitButton ? submitButton.querySelector(".btn-label") : null;
    const buttonLoading = submitButton ? submitButton.querySelector(".btn-loading") : null;

    if (!form)
    {
        return;
    }

    function showFeedback(message, type = "")
    {
        if (!feedback)
        {
            return;
        }

        feedback.textContent = message || "";
        feedback.classList.remove("is-success", "is-error", "is-visible");

        if (message)
        {
            feedback.classList.add("is-visible");

            if (type === "success")
            {
                feedback.classList.add("is-success");
            }
            else if (type === "error")
            {
                feedback.classList.add("is-error");
            }
        }
    }

    function clearFieldErrors()
    {
        const errorElements = form.querySelectorAll("[data-error-for]");

        errorElements.forEach((element) =>
        {
            element.textContent = "";
        });

        const fields = form.querySelectorAll("input, textarea, select");

        fields.forEach((field) =>
        {
            field.classList.remove("is-invalid");
            field.removeAttribute("aria-invalid");
        });
    }

    function showFieldErrors(errors = {})
    {
        Object.entries(errors).forEach(([fieldName, message]) =>
        {
            if (!message || fieldName === "general")
            {
                return;
            }

            const field = form.querySelector(`[name="${fieldName}"]`);
            const errorElement = form.querySelector(`[data-error-for="${fieldName}"]`);

            if (field)
            {
                field.classList.add("is-invalid");
                field.setAttribute("aria-invalid", "true");
            }

            if (errorElement)
            {
                errorElement.textContent = message;
            }
        });
    }

    function setSubmittingState(isSubmitting)
    {
        if (!submitButton)
        {
            return;
        }

        submitButton.disabled = isSubmitting;
        submitButton.classList.toggle("is-submitting", isSubmitting);

        if (buttonLabel)
        {
            buttonLabel.textContent = "Send Message";
            buttonLabel.style.display = isSubmitting ? "none" : "";
        }

        if (buttonLoading)
        {
            buttonLoading.style.display = isSubmitting ? "inline" : "none";
        }
    }

    async function parseResponse(response)
    {
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json"))
        {
            return response.json();
        }

        const text = await response.text();

        return {
            ok: false,
            errors: {
                general: text || "Something went wrong. Please try again later."
            }
        };
    }

    function resetRecaptcha()
    {
        if (typeof grecaptcha !== "undefined")
        {
            try
            {
                grecaptcha.reset();
            }
            catch (error)
            {
                console.error("Failed to reset reCAPTCHA:", error);
            }
        }
    }

    form.addEventListener("submit", async (event) =>
    {
        event.preventDefault();

        clearFieldErrors();
        showFeedback("", "");
        setSubmittingState(true);

        try
        {
            const formData = new FormData(form);
            const encodedBody = new URLSearchParams();

            for (const [key, value] of formData.entries())
            {
                encodedBody.append(key, value);
            }

            const response = await fetch(form.action, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                body: encodedBody.toString()
            });

            const data = await parseResponse(response);

            if (!response.ok || !data.ok)
            {
                showFieldErrors(data.errors || {});
                showFeedback(
                    data.errors?.general || "Please correct the form and try again.",
                    "error"
                );
                setSubmittingState(false);
                resetRecaptcha();
                return;
            }

            form.reset();
            clearFieldErrors();
            showFeedback(
                data.message || "Your message has been sent successfully.",
                "success"
            );
            setSubmittingState(false);
            resetRecaptcha();

            if (feedback)
            {
                feedback.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });
            }
        }
        catch (error)
        {
            console.error("Contact form submission failed:", error);
            showFeedback("Something went wrong. Please try again later.", "error");
            setSubmittingState(false);
            resetRecaptcha();
        }
    });

    const fields = form.querySelectorAll("input, textarea");

    fields.forEach((field) =>
    {
        field.addEventListener("input", () =>
        {
            const errorElement = form.querySelector(`[data-error-for="${field.name}"]`);

            field.classList.remove("is-invalid");
            field.removeAttribute("aria-invalid");

            if (errorElement)
            {
                errorElement.textContent = "";
            }
        });
    });

    if (buttonLoading)
    {
        buttonLoading.style.display = "none";
    }
});