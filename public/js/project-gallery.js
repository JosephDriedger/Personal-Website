document.addEventListener("DOMContentLoaded", () => {
    const links = Array.from(document.querySelectorAll(".gallery-link"));
    const lightbox = document.querySelector(".gallery-lightbox");

    if (!links.length || !lightbox || typeof lightbox.showModal !== "function") {
        return;
    }

    const image = lightbox.querySelector("img");
    const caption = lightbox.querySelector("figcaption");
    let currentIndex = 0;

    const show = (index) => {
        currentIndex = (index + links.length) % links.length;
        const link = links[currentIndex];

        image.src = link.href;
        image.alt = link.dataset.galleryCaption || "";
        caption.textContent = link.dataset.galleryCaption || "";
    };

    links.forEach((link, index) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            show(index);
            lightbox.showModal();
        });
    });

    lightbox.querySelector(".gallery-close").addEventListener("click", () => lightbox.close());
    lightbox.querySelector(".gallery-prev").addEventListener("click", () => show(currentIndex - 1));
    lightbox.querySelector(".gallery-next").addEventListener("click", () => show(currentIndex + 1));

    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) {
            lightbox.close();
        }
    });

    lightbox.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
            show(currentIndex - 1);
        } else if (event.key === "ArrowRight") {
            show(currentIndex + 1);
        }
    });
});
