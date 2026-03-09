document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    const navLinks = document.querySelectorAll(".site-nav a");

    navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        const isHome = href === "/" && path === "/";
        const isSection = href !== "/" && path.startsWith(href);

        if (isHome || isSection) {
            link.classList.add("is-active");
        }
    });

    const revealElements = document.querySelectorAll(".reveal-on-scroll");

    if ("IntersectionObserver" in window && revealElements.length > 0) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
            }
        );

        revealElements.forEach((element) => observer.observe(element));
    } else {
        revealElements.forEach((element) => element.classList.add("is-visible"));
    }

    const contactForm = document.querySelector(".contact-form");

    if (contactForm) {
        contactForm.addEventListener("submit", (event) => {
            const fields = [
                {
                    element: contactForm.querySelector("#name"),
                    validator: (value) => value.trim().length >= 2,
                    message: "Please enter your name.",
                },
                {
                    element: contactForm.querySelector("#email"),
                    validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
                    message: "Please enter a valid email address.",
                },
                {
                    element: contactForm.querySelector("#message"),
                    validator: (value) => value.trim().length >= 10,
                    message: "Please enter a message with at least 10 characters.",
                },
            ];

            let hasError = false;

            fields.forEach((field) => {
                const formGroup = field.element.closest(".form-group");
                const errorText = formGroup.querySelector(".field-error");
                const isValid = field.validator(field.element.value);

                if (!isValid) {
                    hasError = true;
                    field.element.classList.add("input-error");
                    errorText.textContent = field.message;
                } else {
                    field.element.classList.remove("input-error");
                    errorText.textContent = "";
                }
            });

            if (hasError) {
                event.preventDefault();
            }
        });
    }
});
