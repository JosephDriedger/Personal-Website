// Confirm before any form marked data-confirm is submitted (no inline handlers: CSP forbids them).
document.addEventListener("submit", (event) =>
{
    const message = event.target.getAttribute && event.target.getAttribute("data-confirm");

    if (message && !window.confirm(message))
    {
        event.preventDefault();
    }
});

// Keep the unread-messages badge (and tab title) current without a page reload.
(function watchMessages()
{
    const badge = document.getElementById("unread-badge");

    if (!badge)
    {
        return;
    }

    const baseTitle = document.title.replace(/^\(\d+\)\s*/, "");

    function show(count)
    {
        badge.textContent = String(count);
        badge.classList.toggle("hidden", count <= 0);
        document.title = count > 0 ? `(${count}) ${baseTitle}` : baseTitle;
    }

    async function poll()
    {
        try
        {
            const response = await fetch(badge.getAttribute("data-count-url"), { credentials: "same-origin", headers: { Accept: "application/json" } });

            if (response.ok)
            {
                show((await response.json()).unread || 0);
            }
        }
        catch (error)
        {
            // Offline or signed out: leave the badge as it is.
        }
    }

    setInterval(() =>
    {
        if (!document.hidden)
        {
            poll();
        }
    }, 30000);

    document.addEventListener("visibilitychange", () =>
    {
        if (!document.hidden)
        {
            poll();
        }
    });
})();
