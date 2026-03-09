document.addEventListener("DOMContentLoaded", () => {
    const projectGrid = document.querySelector("#project-grid");
    const searchInput = document.querySelector("#project-search");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const emptyMessage = document.querySelector("#project-empty-message");

    if (!projectGrid || !searchInput || filterButtons.length === 0) {
        return;
    }

    const projectCards = Array.from(projectGrid.querySelectorAll(".project-card"));
    let activeFilter = "all";

    const applyFilters = () => {
        const query = searchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        projectCards.forEach((card) => {
            const title = card.dataset.title || "";
            const category = card.dataset.category || "";
            const type = card.dataset.type || "";

            const matchesFilter = activeFilter === "all" || category.includes(activeFilter) || type.includes(activeFilter);
            const matchesSearch = !query || title.includes(query) || category.includes(query) || type.includes(query);
            const shouldShow = matchesFilter && matchesSearch;

            card.classList.toggle("hidden", !shouldShow);

            if (shouldShow) {
                visibleCount += 1;
            }
        });

        if (emptyMessage) {
            emptyMessage.classList.toggle("hidden", visibleCount !== 0);
        }
    };

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            filterButtons.forEach((filterButton) => filterButton.classList.remove("is-active"));
            button.classList.add("is-active");
            activeFilter = button.dataset.filter;
            applyFilters();
        });
    });

    searchInput.addEventListener("input", applyFilters);
});
