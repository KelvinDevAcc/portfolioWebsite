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
const overlay = document.querySelector(".overlay");
const closeButtons = document.querySelectorAll(".close-btn, .close-project-btn");


const modalTitle = document.getElementById("modal-title");
const modalDescriptionAbout = document.getElementById("modal-description-about");
const modalDescriptionDid = document.getElementById("modal-description-did");
const modalImage = document.getElementById("modal-image");
const modalIframeWrapper = document.getElementById("modal-iframe-wrapper");
const modalIframe = document.getElementById("modal-iframe");
//const modalExtraImages = document.getElementById("modal-extra-images");
const modalFooter = document.getElementById("modal-footer");
const modalButtons = document.getElementById("modal-buttons");
const modalExtraImages = document.getElementById("modal-images");

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
        modalImage.src = "";
        modalIframeWrapper.style.display = "none";
        modalIframe.src = "";
        modalFooter.replaceChildren();
        modalButtons.replaceChildren();
        modalExtraImages.replaceChildren();

        const modalContent = modal.querySelector(".modal-content");
        if (modalContent) modalContent.scrollTop = 0; // reset scroll
    }

    function closeModal() {
        modal.classList.remove("open");
        overlay.classList.remove("open");
        document.body.style.overflow = "";
        clearModal();
        if (lastFocused) lastFocused.focus();
    }


    cards.forEach(card => {
        card.addEventListener("click", () => {
            lastFocused = document.activeElement;
            clearModal();

            // Update modal content
            modalTitle.textContent = card.dataset.title || "";

            const modalDescriptionAbout = document.getElementById("modal-description-about");
            const modalDescriptionDid = document.getElementById("modal-description-did");

            modalDescriptionAbout.textContent = card.dataset.descriptionAbout || "";
            modalDescriptionDid.textContent = card.dataset.descriptionDid || "";

            // Handle image
            if (card.dataset.image) {
                modalImage.src = card.dataset.image;
                modalImage.style.display = "block";
            }

            // Handle video (YouTube or file)
            if (card.dataset.video) {
                const videoURL = card.dataset.video;
                if (videoURL.includes("youtube.com") || videoURL.includes("youtu.be")) {
                    modalIframe.src = getYouTubeEmbedURL(videoURL);
                    modalIframeWrapper.style.display = "block";
                }
            }

            // Handle PDF link
            if (card.dataset.pdf) {
                modalPdfLink.href = card.dataset.pdf;
                modalPdfLink.style.display = "inline-block";
            }

            // Fill modal footer with bullets
            if (card.dataset.bullets) {
                try {
                    const bullets = JSON.parse(card.dataset.bullets);
                    const headers = [];
                    const values = [];

                    bullets.forEach(bullet => {
                        const parts = bullet.split(": ");
                        if (parts.length === 2) {
                            headers.push(parts[0]);
                            values.push(parts[1]);
                        }
                    });

                    // Clear footer first
                    modalFooter.innerHTML = "";

                    // Create a table element
                    const table = document.createElement("table");
                    table.classList.add("modal-footer-table");  // add a class for styling

                    // Create header row
                    const thead = document.createElement("thead");
                    const headerRow = document.createElement("tr");
                    headers.forEach(headerText => {
                        const th = document.createElement("th");
                        th.textContent = headerText;
                        headerRow.appendChild(th);
                    });
                    thead.appendChild(headerRow);
                    table.appendChild(thead);

                    // Create values row
                    const tbody = document.createElement("tbody");
                    const valueRow = document.createElement("tr");
                    values.forEach(valueText => {
                        const td = document.createElement("td");
                        td.textContent = valueText;
                        valueRow.appendChild(td);
                    });
                    tbody.appendChild(valueRow);
                    table.appendChild(tbody);

                    // Append table to modal footer
                    modalFooter.appendChild(table);
                } catch (e) {
                    console.error("Bullet JSON error", e);
                }
            }

            function createButton(text, url) {
                const btn = document.createElement("button");
                btn.textContent = text;
                btn.classList.add("btn"); // use your btn class styling
                btn.onclick = () => window.open(url, "_blank"); // open link in new tab
                let iconClass = "";
                if (text.toLowerCase().includes("itch")) {
                    iconClass = "fab fa-itch-io";
                } else if (text.toLowerCase().includes("github")) {
                    iconClass = "fab fa-github";
                }

                // Insert icon + text
                btn.innerHTML = iconClass
                    ? `<i class="${iconClass}" style="margin-right: 0.5rem;"></i>${text}`
                    : text;

                return btn;
            }

            // Example: check if your card has itch or github links in data attributes
            if (card.dataset.itchio) {
                modalButtons.appendChild(createButton("View on Itch.io", card.dataset.itchio));
            }
            if (card.dataset.github) {
                modalButtons.appendChild(createButton("View on GitHub", card.dataset.github));
            }
            if (card.dataset.webPage) {
                modalButtons.appendChild(createButton("View on WebPage", card.dataset.webPage));
            }





            // Show modal + overlay
            modal.classList.add("open");
            document.querySelector(".overlay").classList.add("open");
            document.body.style.overflow = "hidden";
        });
    });


    // Close Modal
   closeButtons.forEach(btn => btn.addEventListener("click", closeModal));
    overlay.addEventListener("click", closeModal);
});


