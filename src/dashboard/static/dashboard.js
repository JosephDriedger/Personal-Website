// Confirm before any form marked data-confirm is submitted (no inline handlers: CSP forbids them).
document.addEventListener("submit", (event) =>
{
    const message = event.target.getAttribute && event.target.getAttribute("data-confirm");

    if (message && !window.confirm(message))
    {
        event.preventDefault();
    }
});
