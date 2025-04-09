// Smooth Scroll for Sidebar Links
document.querySelectorAll('.sidebar nav a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.content').scrollIntoView({ behavior: 'smooth' });
    });
});

// Project Card Tilt Effect
document.addEventListener('DOMContentLoaded', () => {
    // === Tilt Effect ===
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * 12;
            const rotateY = ((x - centerX) / centerX) * -12;

            card.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale(1.03)
            `;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `
                perspective(1000px)
                rotateX(0deg)
                rotateY(0deg)
                scale(1)
            `;
        });
    });

    // === Tag Injection ===
    document.querySelectorAll('.project-card').forEach(card => {
        const bullets = JSON.parse(card.dataset.bullets || "[]");
        const tagContainer = card.querySelector('.tag-container');

        if (tagContainer) {
            bullets.forEach(bullet => {
                const parts = bullet.split(': ');
                const type = parts[0]?.toLowerCase();   // engine, language, genre
                const value = parts[1]?.trim();         // Unity, C#, etc.

                if (!type || !value) return;

                const tag = document.createElement('span');
                tag.textContent = value;
                tag.classList.add('tag');

                // Add category class (engine, language, genre)
                tag.classList.add(type);

                // Add value class (e.g., unity, csharp)
                const cleanValue = value.toLowerCase().replace(/[^a-z0-9]/g, '');
                tag.classList.add(cleanValue);

                tagContainer.appendChild(tag);
            });
        }
    });
});


// Modal Elements
const modal = document.getElementById("project-modal");
const modalTitle = document.getElementById("modal-title");
const modalImage = document.getElementById("modal-image");
const modalVideo = document.getElementById("modal-video");
const modalIframe = document.getElementById("modal-iframe");
const modalDescription = document.getElementById("modal-description");
const modalBullets = document.getElementById("modal-bullets");
const modalExtraImages = document.getElementById("modal-extra-images");
const modalPdfLink = document.getElementById("modal-pdf-link");
const closeButton = document.querySelector(".close-button");
const modalGallery = document.getElementById("modal-gallery"); // if you're using modal-gallery

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

// Open Modal and Populate
document.querySelectorAll(".project-card").forEach(card => {
    card.addEventListener("click", () => {
        const {
            title,
            description,
            image,
            video,
            bullets,
            extraImages,
            pdf
        } = card.dataset;

        // Set basic content
        modalTitle.textContent = title;
        modalDescription.textContent = description;

        // Reset media
        modalImage.style.display = "none";
        modalVideo.style.display = "none";
        modalIframe.style.display = "none";
        modalVideo.pause();
        modalVideo.src = "";
        modalIframe.src = "";

        // Load media
        if (video && (video.includes("youtube.com") || video.includes("youtu.be"))) {
            modalIframe.src = getYouTubeEmbedURL(video);
            modalIframe.style.display = "block";
        } else if (video) {
            modalVideo.src = video;
            modalVideo.style.display = "block";
            modalVideo.load();
            modalVideo.play();
        } else {
            modalImage.src = image;
            modalImage.alt = title;
            modalImage.style.display = "block";
        }

        // Bullet Points
        modalBullets.innerHTML = "";
        try {
            const parsedBullets = JSON.parse(bullets || "[]");
            parsedBullets.forEach(bullet => {
                const li = document.createElement("li");
                li.textContent = bullet;
                modalBullets.appendChild(li);
            });
        } catch (err) {
            console.error("Bullet list parse error:", err);
        }

        // Extra Images
        modalExtraImages.innerHTML = "";
        try {
            const parsedExtras = JSON.parse(extraImages || "[]");
            parsedExtras.forEach(src => {
                const img = document.createElement("img");
                img.src = src;
                img.alt = "Extra screenshot";
                img.classList.add("modal-extra-img");
                modalExtraImages.appendChild(img);
            });
        } catch (err) {
            console.error("Extra images parse error:", err);
        }

        // PDF Link
        if (pdf) {
            modalPdfLink.href = pdf;
            modalPdfLink.style.display = "inline-block";
        } else {
            modalPdfLink.href = "#";
            modalPdfLink.style.display = "none";
        }

        // Show Modal
        modal.style.display = "flex";
        setTimeout(() => modal.classList.add("open"), 10);
        document.body.classList.add("modal-open");
    });
});


closeButton.addEventListener("click", () => {
    closeModal();
});

modal.addEventListener("click", e => {
    if (e.target === modal) {
        closeModal();
    }
});

function closeModal() {
    modal.classList.remove("open");
    setTimeout(() => (modal.style.display = "none"), 300);
    document.body.classList.remove("modal-open");

    modalVideo.pause();
    modalVideo.currentTime = 0;
    modalVideo.src = "";
    modalIframe.src = "";

    modalBullets.innerHTML = "";
    modalExtraImages.innerHTML = "";
    modalPdfLink.href = "#";
    modalPdfLink.style.display = "none";
}

