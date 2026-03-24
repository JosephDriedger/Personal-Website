document.addEventListener("DOMContentLoaded", () => {
    const projectGrid = document.querySelector("#project-grid");
    const searchInput = document.querySelector("#project-search");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const emptyMessage = document.querySelector("#project-empty-message");

    const technologySelect = document.querySelector("#project-technology-select");
    const technologyTrigger = document.querySelector("#project-technology-trigger");
    const technologyMenu = document.querySelector("#project-technology-menu");
    const technologyLabel = technologyTrigger
        ? technologyTrigger.querySelector(".custom-select-label")
        : null;
    const technologyOptions = technologyMenu
        ? Array.from(technologyMenu.querySelectorAll(".custom-select-option"))
        : [];

    if (!projectGrid || !searchInput || filterButtons.length === 0) {
        return;
    }

    const projectCards = Array.from(projectGrid.querySelectorAll(".project-card"));
    let activeFilter = "all";
    let activeTechnology = "all";

    const closeTechnologyMenu = () => {
        if (!technologyTrigger || !technologyMenu) {
            return;
        }

        technologyTrigger.setAttribute("aria-expanded", "false");
        technologyMenu.classList.add("hidden");
        technologySelect.classList.remove("is-open");
    };

    const openTechnologyMenu = () => {
        if (!technologyTrigger || !technologyMenu) {
            return;
        }

        technologyTrigger.setAttribute("aria-expanded", "true");
        technologyMenu.classList.remove("hidden");
        technologySelect.classList.add("is-open");
    };

    const setTechnologyOptionState = (selectedValue, selectedText) => {
        technologyOptions.forEach((option) => {
            const isSelected = option.dataset.value === selectedValue;
            option.classList.toggle("is-selected", isSelected);
            option.setAttribute("aria-selected", isSelected ? "true" : "false");
        });

        if (technologyLabel) {
            technologyLabel.textContent = selectedText;
        }

        if (technologySelect) {
            technologySelect.dataset.selected = selectedValue;
        }
    };

    const applyFilters = () => {
        const query = searchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        projectCards.forEach((card) => {
            const title = card.dataset.title || "";
            const category = card.dataset.category || "";
            const type = card.dataset.type || "";
            const technologies = card.dataset.technologies || "";

            const matchesFilter =
                activeFilter === "all" ||
                category.includes(activeFilter) ||
                type.includes(activeFilter);

            const matchesTechnology =
                activeTechnology === "all" ||
                technologies.split("|").includes(activeTechnology);

            const matchesSearch =
                !query ||
                title.includes(query) ||
                category.includes(query) ||
                type.includes(query) ||
                technologies.includes(query);

            const shouldShow = matchesFilter && matchesTechnology && matchesSearch;

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
            activeFilter = button.dataset.filter || "all";
            applyFilters();
        });
    });

    if (technologyTrigger && technologyMenu && technologyOptions.length) {
        technologyTrigger.addEventListener("click", () => {
            const isOpen = technologyTrigger.getAttribute("aria-expanded") === "true";

            if (isOpen) {
                closeTechnologyMenu();
            } else {
                openTechnologyMenu();
            }
        });

        technologyOptions.forEach((option) => {
            option.addEventListener("click", () => {
                activeTechnology = option.dataset.value || "all";
                setTechnologyOptionState(activeTechnology, option.textContent.trim());
                closeTechnologyMenu();
                applyFilters();
            });
        });

        document.addEventListener("click", (event) => {
            if (!technologySelect.contains(event.target)) {
                closeTechnologyMenu();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeTechnologyMenu();
            }
        });
    }

    searchInput.addEventListener("input", applyFilters);
});