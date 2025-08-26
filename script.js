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
const modalImage = document.getElementById("modal-image");
const modalIframeWrapper = document.getElementById("modal-iframe-wrapper");
const modalIframe = document.getElementById("modal-iframe");
const modalFooter = document.getElementById("modal-footer");
const modalButtons = document.getElementById("modal-buttons");
const modalExtraImages = document.getElementById("modal-image");

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
        modalImage.style.display = "none";
        modalImage.src = "";
        modalIframeWrapper.style.display = "none";
        modalIframe.src = "";
        modalFooter.replaceChildren();
        modalButtons.replaceChildren();
        modalExtraImages.replaceChildren();
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

            if (card.dataset.image) {
                modalImage.src = card.dataset.image;
                modalImage.style.display = "block";
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
                    const headers = [];
                    const values = [];
                    bullets.forEach(b => {
                        const parts = b.split(": ");
                        if (parts.length === 2) {
                            headers.push(parts[0]);
                            values.push(parts[1]);
                        }
                    });
                    if (headers.length) {
                        const table = document.createElement("table");
                        table.classList.add("modal-footer-table");
                        const thead = document.createElement("thead");
                        const headerRow = document.createElement("tr");
                        headers.forEach(h => {
                            const th = document.createElement("th");
                            th.textContent = h;
                            headerRow.appendChild(th);
                        });
                        thead.appendChild(headerRow);
                        table.appendChild(thead);

                        const tbody = document.createElement("tbody");
                        const valueRow = document.createElement("tr");
                        values.forEach(v => {
                            const td = document.createElement("td");
                            td.textContent = v;
                            valueRow.appendChild(td);
                        });
                        tbody.appendChild(valueRow);
                        table.appendChild(tbody);

                        modalFooter.appendChild(table);
                    }
                } catch (e) { console.error("Bullet JSON error", e); }
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
