document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.querySelector(".nav-toggle");
    const siteNav = document.querySelector(".site-nav");

    if (!toggleButton || !siteNav) {
        return;
    }

    toggleButton.addEventListener("click", () => {
        const isOpen = siteNav.classList.toggle("is-open");
        toggleButton.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", (event) => {
        const clickedInsideNav = event.target.closest(".nav-container");

        if (!clickedInsideNav && siteNav.classList.contains("is-open")) {
            siteNav.classList.remove("is-open");
            toggleButton.setAttribute("aria-expanded", "false");
        }
    });
});
