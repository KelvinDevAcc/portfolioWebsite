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

// Modal Elements (declared globally for reuse)
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

document.addEventListener("DOMContentLoaded", () => {
    // === Smooth Scroll for Sidebar Links ===
    document.querySelectorAll('.sidebar nav a').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelector('.content').scrollIntoView({ behavior: 'smooth' });
        });
    });

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

    // === Modal Logic ===
    const cards = document.querySelectorAll(".project-card");

    function clearModal() {
        modalImage.style.display = "none";
        modalVideo.style.display = "none";
        modalIframe.style.display = "none";
        modalPdfLink.style.display = "none";
        modalBullets.innerHTML = "";
        modalExtraImages.innerHTML = "";
        modalImage.src = "";
        modalVideo.src = "";
        modalIframe.src = "";
    }

    cards.forEach(card => {
        card.addEventListener("click", () => {
            clearModal();

            modalTitle.textContent = card.dataset.title || "";
            modalDescription.textContent = card.dataset.description || "";

            if (card.dataset.image) {
                modalImage.src = card.dataset.image;
                modalImage.style.display = "block";
            }

            if (card.dataset.video) {
                const videoURL = card.dataset.video;
                if (videoURL.includes("youtube.com") || videoURL.includes("youtu.be")) {
                    modalIframe.src = getYouTubeEmbedURL(videoURL);
                    modalIframe.style.display = "block";
                } else {
                    modalVideo.src = videoURL;
                    modalVideo.style.display = "block";
                }
            }
            
            if (card.dataset.iframe) {
                modalIframe.src = getYouTubeEmbedURL(card.dataset.iframe) || card.dataset.iframe;
                modalIframe.style.display = "block";
            }

            if (card.dataset.bullets) {
                try {
                    const bullets = JSON.parse(card.dataset.bullets);
                    bullets.forEach(bullet => {
                        const li = document.createElement("li");
                        li.textContent = bullet;
                        modalBullets.appendChild(li);
                    });
                } catch (e) {
                    console.error("Bullet JSON error", e);
                }
            }

            if (card.dataset.pdf) {
                modalPdfLink.href = card.dataset.pdf;
                modalPdfLink.style.display = "inline-block";
            }

            if (card.dataset.extraImages) {
                try {
                    const images = JSON.parse(card.dataset.extraImages);
                    images.forEach(src => {
                        const img = document.createElement("img");
                        img.src = src;
                        img.classList.add("gallery-image");
                        modalExtraImages.appendChild(img);
                    });
                } catch (e) {
                    console.error("Extra Images JSON error", e);
                }
            }

            modal.classList.add("open");
        });
    });

    // Close Modal
    closeButton.addEventListener("click", () => {
        modal.classList.remove("open");
        clearModal();
      });
      
      window.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("open");
          clearModal();
        }
      });
});


