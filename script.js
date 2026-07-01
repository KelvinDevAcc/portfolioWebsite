// Utility: Get YouTube embed URL
function getYouTubeEmbedURL(url) {
    try {
        const videoUrl = new URL(url);
        let videoId = "";

        if (videoUrl.hostname.includes("youtube.com")) {
            videoId = videoUrl.searchParams.get("v") || "";
        } else if (videoUrl.hostname.includes("youtu.be")) {
            videoId = videoUrl.pathname.replace("/", "");
        }

        if (!videoId) return "";

        const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
        embedUrl.searchParams.set("autoplay", "1");
        embedUrl.searchParams.set("playsinline", "1");
        embedUrl.searchParams.set("rel", "0");

        const startTime = videoUrl.searchParams.get("t");
        if (startTime) {
            embedUrl.searchParams.set("start", startTime.replace("s", ""));
        }

        return embedUrl.toString();
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
const modalVideo = document.getElementById("modal-video");

const modalHeaderTags = document.getElementById("modal-header-tags");
const modalButtons = document.getElementById("modal-buttons");

const modalMainImage = document.getElementById("modal-main-image");
const modalThumbnails = document.getElementById("modal-thumbnails");

const mediaGallery = document.getElementById("media-gallery");
const mediaTitle = document.getElementById("media-gallery-title");

let lastFocused = null;

const coloredTagClasses = new Set([
    "language",
    "genre",
    "status",
    "ownengine",
    "unity",
    "unreal",
    "csharp",
    "cpp",
    "html",
    "shooter",
    "platformer",
    "gamejam",
    "vr",
    "fitness",
    "company-assignment",
    "multiplayer-online",
    "multiplayer-coop",
    "hololens"
]);

function getTagData(bullet) {
    const parts = bullet.split(": ");
    const type = parts[0]?.toLowerCase();
    const value = parts[1]?.trim();

    if (!type || !value) return null;

    const valueClass = value.toLowerCase().replace(/[^a-z0-9]/g, "");
    const hasColor = coloredTagClasses.has(type) || coloredTagClasses.has(valueClass);

    return { type, value, valueClass, hasColor };
}

function sortTags(tags) {
    return tags.sort((a, b) => Number(b.hasColor) - Number(a.hasColor));
}

document.addEventListener("DOMContentLoaded", () => {

    const cards = document.querySelectorAll(".project-card");

    // =========================
    // Tilt effect
    // =========================
    cards.forEach(card => {
        card.addEventListener("mousemove", e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * 12;
            const rotateY = ((x - centerX) / centerX) * -12;

            card.style.transform =
                `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform =
                "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
        });
    });

    // =========================
    // Tag injection
    // =========================
    cards.forEach(card => {
        const tags = sortTags(
            JSON.parse(card.dataset.bullets || "[]")
                .map(getTagData)
                .filter(Boolean)
        );
        const tagContainer = card.querySelector(".tag-container");

        if (!tagContainer) return;

        tags.forEach(tagData => {
            const tag = document.createElement("span");
            tag.textContent = tagData.value;
            tag.classList.add(
                "tag",
                tagData.type,
                tagData.valueClass
            );

            tagContainer.appendChild(tag);
        });
    });

    // =========================
    // Clear modal
    // =========================
    function clearModal() {

        modalIframeWrapper.style.display = "none";
        modalIframe.src = "";
        modalVideo.pause();
        modalVideo.removeAttribute("src");
        modalVideo.load();
        modalVideo.style.display = "none";

        modalHeaderTags.replaceChildren();
        modalButtons.replaceChildren();

        modalMainImage.src = "";
        modalMainImage.style.display = "none";
        modalThumbnails.replaceChildren();

        mediaGallery.replaceChildren();
        mediaTitle.style.display = "none";

        document.querySelector(".modal-images-wrapper").style.display = "none";
        modalThumbnails.style.display = "none";


        const prev = document.getElementById("prev-image");
        const next = document.getElementById("next-image");

        if (prev) prev.style.display = "none";
        if (next) next.style.display = "none";

        const modalContent = modal.querySelector(".modal-content");
        if (modalContent) modalContent.scrollTop = 0;
    }

    // =========================
    // Close modal
    // =========================
    function closeModal() {
        modal.classList.remove("open");
        overlay.classList.remove("open");
        document.body.style.overflow = "";

        clearModal();

        if (lastFocused) lastFocused.focus();
    }

    // =========================
    // Open modal
    // =========================
    cards.forEach(card => {
        card.addEventListener("click", () => {

            lastFocused = document.activeElement;

            clearModal();

            modalTitle.textContent = card.dataset.title || "";
            modalDescriptionAbout.textContent = card.dataset.descriptionAbout || "";
            modalDescriptionDid.textContent = card.dataset.descriptionDid || "";

            // =========================
            // Image gallery
            // =========================
            if (card.dataset.images) {
                try {
                    const images = JSON.parse(card.dataset.images || "[]");

                    const imageWrapper = document.querySelector(".modal-images-wrapper");
                    const modalThumbnails = document.getElementById("modal-thumbnails");
                    const prevBtn = document.getElementById("prev-image");
                    const nextBtn = document.getElementById("next-image");

                    let currentIndex = 0;

                    if (!images.length) {
                        imageWrapper.style.display = "none";
                        modalThumbnails.style.display = "none";
                        return;
                    }

                    imageWrapper.style.display = "flex";
                    modalThumbnails.style.display = "flex";

                    modalMainImage.src = images[0];
                    modalMainImage.style.display = "block";

                    modalThumbnails.replaceChildren();

                    const updateImage = () => {
                        modalMainImage.src = images[currentIndex];

                        modalThumbnails.querySelectorAll("img").forEach((img, i) => {
                            img.classList.toggle("active", i === currentIndex);
                        });
                    };

                    images.forEach((src, index) => {
                        const thumb = document.createElement("img");
                        thumb.src = src;

                        if (index === 0) thumb.classList.add("active");

                        thumb.addEventListener("click", () => {
                            currentIndex = index;
                            updateImage();
                        });

                        modalThumbnails.appendChild(thumb);
                    });

                    prevBtn.style.display = images.length > 1 ? "block" : "none";
                    nextBtn.style.display = images.length > 1 ? "block" : "none";

                    prevBtn.onclick = () => {
                        currentIndex = (currentIndex - 1 + images.length) % images.length;
                        updateImage();
                    };

                    nextBtn.onclick = () => {
                        currentIndex = (currentIndex + 1) % images.length;
                        updateImage();
                    };

                } catch (e) {
                    console.error("Image JSON error", e);
                }
            }
            // =========================
            // Showcase (MP4 / GIF)
            // =========================
            if (card.dataset.showcase) {

                let showcase = [];

                try {
                    showcase = JSON.parse(card.dataset.showcase || "[]");
                } catch (e) {
                    console.error("Showcase JSON error", e);
                }

                if (showcase.length > 0) {
                    mediaTitle.style.display = "block";
                }

                showcase.forEach(item => {

                    const wrapper = document.createElement("div");
                    wrapper.classList.add("showcase-item");

                    let media;

                    if (item.type === "video") {
                        media = document.createElement("video");

                        media.src = item.src;
                        media.autoplay = true;
                        media.loop = true;
                        media.muted = true;
                        media.playsInline = true;
                        media.controls = true;

                        media.addEventListener("loadeddata", () => {
                            media.play().catch(() => { });
                        });
                    }

                    if (item.type === "gif" || item.type === "image") {
                        media = document.createElement("img");
                        media.src = item.src;
                    }

                    const title = document.createElement("p");
                    title.textContent = item.title || "";

                    wrapper.appendChild(media);
                    wrapper.appendChild(title);

                    mediaGallery.appendChild(wrapper);
                });
            }

            // =========================
            // YouTube video
            // =========================
            if (card.dataset.video) {
                const url = card.dataset.video;

                if (url.includes("youtube.com") || url.includes("youtu.be")) {
                    modalIframe.src = getYouTubeEmbedURL(url);
                    modalIframeWrapper.style.display = "block";
                } else if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
                    modalVideo.src = url;
                    modalVideo.style.display = "block";
                    modalVideo.play().catch(() => { });
                }
            }

            // =========================
            // Tags
            // =========================
            if (card.dataset.bullets) {
                try {
                    const tags = sortTags(
                        JSON.parse(card.dataset.bullets || "[]")
                            .map(getTagData)
                            .filter(Boolean)
                    );

                    const tagsContainer = document.createElement("div");
                    tagsContainer.classList.add("modal-tags-container");

                    tags.forEach(tagData => {
                        const tag = document.createElement("span");
                        tag.textContent = tagData.value;
                        tag.classList.add("tag", tagData.type, tagData.valueClass);

                        tagsContainer.appendChild(tag);
                    });

                    modalHeaderTags.appendChild(tagsContainer);

                } catch (e) {
                    console.error("Bullet JSON error", e);
                }
            }

            // =========================
            // Buttons
            // =========================
            function createButton(text, url) {
                const btn = document.createElement("button");
                btn.classList.add("btn");
                btn.textContent = text;

                btn.onclick = () => window.open(url, "_blank");

                return btn;
            }

            if (card.dataset.itchio)
                modalButtons.appendChild(createButton("View on Itch.io", card.dataset.itchio));

            if (card.dataset.github)
                modalButtons.appendChild(createButton("View on GitHub", card.dataset.github));

            if (card.dataset.webPage)
                modalButtons.appendChild(createButton("View on WebPage", card.dataset.webPage));

            // =========================
            // Show modal
            // =========================
            modal.classList.add("open");
            overlay.classList.add("open");
            document.body.style.overflow = "hidden";
        });
    });

    function toggleActiveOnClick(selector) {
        const element = document.querySelector(selector);

        if (!element) return;

        element.addEventListener("click", () => {
            element.classList.toggle("active");
        });
    }

    toggleActiveOnClick(".profile-pic");
    toggleActiveOnClick(".logo img");

    // =========================
    // Close handlers
    // =========================
    closeButtons.forEach(btn => btn.addEventListener("click", closeModal));

    overlay.addEventListener("click", closeModal);

    modal.addEventListener("click", e => {
        if (e.target === modal) closeModal();
    });

    modal.querySelector(".modal-content")
        .addEventListener("click", e => e.stopPropagation());
});
