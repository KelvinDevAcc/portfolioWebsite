// Utility: Get YouTube embed URL
function getYouTubeEmbedURL(url) {
    try {
        if (url.includes("youtube.com")) {
            return `https://www.youtube.com/embed/${new URL(url).searchParams.get("v")}?autoplay=1`;
        } else if (url.includes("youtu.be")) {
            return `https://www.youtube.com/embed/${url.split("/").pop()}?autoplay=1`;
        }
    } catch {
        return "";
    }
}

// Modal Elements
const modal = document.getElementById("project-modal");
const overlay = document.querySelector(".overlay");
const closeButtons = document.querySelectorAll(".close-btn, .close-project-btn");
const modalTitle = document.getElementById("modal-title");
const modalDescriptionAbout = document.getElementById("modal-description-about");
const modalDescriptionDid = document.getElementById("modal-description-did");
const modalIframeWrapper = document.getElementById("modal-iframe-wrapper");
const modalIframe = document.getElementById("modal-iframe");
const modalHeaderTags = document.getElementById("modal-header-tags");
const modalButtons = document.getElementById("modal-buttons");
const modalExtraImages = document.getElementById("modal-images");
const modalMainImage = document.getElementById("modal-main-image");
const modalThumbnails = document.getElementById("modal-thumbnails");



let lastFocused = null; // track last focused element

document.addEventListener("DOMContentLoaded", () => {

    const cards = document.querySelectorAll(".project-card");

    // === Tilt Effect ===
    cards.forEach(card => {
        card.addEventListener("mousemove", e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * 12;
            const rotateY = ((x - centerX) / centerX) * -12;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
        });
        card.addEventListener("mouseleave", () => {
            card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
        });
    });

    // === Tag Injection ===
    cards.forEach(card => {
        const bullets = JSON.parse(card.dataset.bullets || "[]");
        const tagContainer = card.querySelector(".tag-container");
        if (tagContainer) {
            bullets.forEach(bullet => {
                const parts = bullet.split(': ');
                const type = parts[0]?.toLowerCase();
                const value = parts[1]?.trim();
                if (!type || !value) return;
                const tag = document.createElement('span');
                tag.textContent = value;
                tag.classList.add('tag', type, value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                tagContainer.appendChild(tag);
            });
        }
    });

    // === Modal Functions ===
    function clearModal() {
        modalIframeWrapper.style.display = "none";
        modalIframe.src = "";
        modalHeaderTags.replaceChildren();
        modalButtons.replaceChildren();
        // Hide and reset the main image
        modalMainImage.src = "";
        modalMainImage.style.display = "none";

        // Clear thumbnails
        modalThumbnails.replaceChildren();
        modalThumbnails.style.display = "flex";

        // Hide navigation buttons
        document.getElementById("prev-image").style.display = "none";
        document.getElementById("next-image").style.display = "none";

        // Reset other modal elements
        modalIframeWrapper.style.display = "none";
        modalIframe.src = "";
        modalHeaderTags.replaceChildren();
        modalButtons.replaceChildren();


        // Reset other modal elements
        modalIframeWrapper.style.display = "none";
        modalIframe.src = "";
        modalHeaderTags.replaceChildren();
        modalButtons.replaceChildren();
        const modalContent = modal.querySelector(".modal-content");
        if (modalContent) modalContent.scrollTop = 0;
    }

    function closeModal() {
        modal.classList.remove("open");
        overlay.classList.remove("open");
        document.body.style.overflow = "";
        clearModal();
        if (lastFocused) lastFocused.focus();
    }

    // Open modal
    cards.forEach(card => {
        card.addEventListener("click", () => {
            lastFocused = document.activeElement;
            clearModal();

            modalTitle.textContent = card.dataset.title || "";
            modalDescriptionAbout.textContent = card.dataset.descriptionAbout || "";
            modalDescriptionDid.textContent = card.dataset.descriptionDid || "";

            if (card.dataset.images) {
                try {
                    const images = JSON.parse(card.dataset.images);
                    let currentIndex = 0;

                    if (images.length > 0) {
                        // set first image as main
                        modalMainImage.src = images[0]; // first image
                        modalMainImage.style.display = "block";

                        // Show buttons only if multiple images
                        const prevBtn = document.getElementById("prev-image");
                        const nextBtn = document.getElementById("next-image");
                        if (images.length > 1) {
                            prevBtn.style.display = "block";
                            nextBtn.style.display = "block";
                        } else {
                            prevBtn.style.display = "none";
                            nextBtn.style.display = "none";
                        }

                        // build thumbnails
                        modalThumbnails.replaceChildren();
                        images.forEach((src, index) => {
                            const thumb = document.createElement("img");
                            thumb.src = src;
                            thumb.alt = card.dataset.title || "Thumbnail";
                            if (index === 0) thumb.classList.add("active");
                            thumb.addEventListener("click", () => {
                                currentIndex = index;
                                updateImage();
                            });
                            modalThumbnails.appendChild(thumb);
                        });

                        // update function
                        function updateImage() {
                            modalMainImage.src = images[currentIndex];
                            modalThumbnails.querySelectorAll("img").forEach((t, i) => {
                                t.classList.toggle("active", i === currentIndex);
                            });
                        }

                        // navigation buttons
                        document.getElementById("prev-image").onclick = () => {
                            currentIndex = (currentIndex - 1 + images.length) % images.length;
                            updateImage();
                        };
                        document.getElementById("next-image").onclick = () => {
                            currentIndex = (currentIndex + 1) % images.length;
                            updateImage();
                        };
                    }
                } catch (e) {
                    console.error("Image JSON error", e);
                }
            }

            if (card.dataset.video) {
                const url = card.dataset.video;
                if (url.includes("youtube.com") || url.includes("youtu.be")) {
                    modalIframe.src = getYouTubeEmbedURL(url);
                    modalIframeWrapper.style.display = "block";
                }
            }

            if (card.dataset.pdf && modalPdfLink) {
                modalPdfLink.href = card.dataset.pdf;
                modalPdfLink.style.display = "inline-block";
            }

            // Bullets table
            if (card.dataset.bullets) {
                try {
                    const bullets = JSON.parse(card.dataset.bullets);
                    const tagsContainer = document.createElement("div");
                    tagsContainer.classList.add("modal-tags-container"); // New class for styling

                    bullets.forEach(bullet => {
                        const parts = bullet.split(': ');
                        const type = parts[0]?.toLowerCase();
                        const value = parts[1]?.trim();
                        if (!type || !value) return;

                        const tag = document.createElement('span');
                        tag.textContent = value;
                        tag.classList.add('tag', type, value.toLowerCase().replace(/[^a-z0-9]/g, ''));

                        // Add a class specifically for modal tags to style them differently if needed
                        tag.classList.add('modal-tag-button');

                        tagsContainer.appendChild(tag);
                    });

                    // Append the container of buttons to the modal footer
                    modalHeaderTags.appendChild(tagsContainer);

                } catch (e) {
                    console.error("Bullet JSON error", e);
                }
            }

            // Buttons
            function createButton(text, url) {
                const btn = document.createElement("button");
                btn.classList.add("btn");
                btn.innerHTML = text;
                btn.onclick = () => window.open(url, "_blank");
                return btn;
            }

            if (card.dataset.itchio) modalButtons.appendChild(createButton("View on Itch.io", card.dataset.itchio));
            if (card.dataset.github) modalButtons.appendChild(createButton("View on GitHub", card.dataset.github));
            if (card.dataset.webPage) modalButtons.appendChild(createButton("View on WebPage", card.dataset.webPage));

            // Show modal
            modal.classList.add("open");
            overlay.classList.add("open");
            document.body.style.overflow = "hidden";

            const modalContent = modal.querySelector(".modal-content");
            if (modalContent) {
                modalContent.scrollTop = 0;
            }
        });
    });

    const profilePic = document.querySelector('.profile-pic');

    profilePic.addEventListener('click', () => {
        profilePic.classList.toggle('active');
    });

    // Close modal
    closeButtons.forEach(btn => btn.addEventListener("click", closeModal));
    overlay.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    modal.querySelector(".modal-content").addEventListener("click", e => e.stopPropagation());
});
