document.addEventListener("DOMContentLoaded", () => {
    const videoGrid = document.querySelector("#video-grid");
    const searchInput = document.querySelector("#video-search");
    const emptyMessage = document.querySelector("#video-empty-message");

    if (!videoGrid || !searchInput) {
        return;
    }

    const videoCards = Array.from(videoGrid.querySelectorAll(".video-card"));

    const applyFilters = () => {
        const query = searchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        videoCards.forEach((card) => {
            const title = card.dataset.title || "";
            const matchesSearch = !query || title.includes(query);

            card.classList.toggle("hidden", !matchesSearch);

            if (matchesSearch) {
                visibleCount += 1;
            }
        });

        if (emptyMessage) {
            emptyMessage.classList.toggle("hidden", visibleCount !== 0);
        }
    };

    searchInput.addEventListener("input", applyFilters);
});