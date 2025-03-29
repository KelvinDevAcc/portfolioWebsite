document.querySelectorAll('.sidebar nav a').forEach(link => {
    link.addEventListener('click', function() {
        document.querySelector('.content').scrollIntoView({ behavior: 'smooth' });
    });
});
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        let rect = card.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        let centerX = rect.width / 2;
        let centerY = rect.height / 2;
        let rotateX = (centerY - y) / 10;
        let rotateY = (x - centerX) / 10;
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'rotateX(0) rotateY(0)';
    });
});

const projectCards = document.querySelectorAll(".project-card");
const modal = document.getElementById("project-modal");
const modalTitle = document.getElementById("modal-title");
const modalImage = document.getElementById("modal-image");
const modalDescription = document.getElementById("modal-description");
const closeButton = document.querySelector(".close-button");

// Open Modal Function
projectCards.forEach(card => {
    card.addEventListener("click", () => {
        modalTitle.textContent = card.dataset.title;
        modalImage.src = card.dataset.image;
        modalImage.alt = card.dataset.title;
        modalDescription.textContent = card.dataset.description;

        modal.classList.add("open");
        document.body.classList.add("modal-open"); // Prevent scrolling
    });
});

// Close Modal
closeButton.addEventListener("click", () => {
    modal.classList.remove("open");
    document.body.classList.remove("modal-open"); // Restore scrolling
});

// Close on Background Click
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.remove("open");
        document.body.classList.remove("modal-open"); // Restore scrolling
    }
});
