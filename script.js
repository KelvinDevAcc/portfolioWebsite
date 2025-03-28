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