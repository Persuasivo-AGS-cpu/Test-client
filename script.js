document.addEventListener('DOMContentLoaded', () => {
    // Basic interaction for the buttons
    const primaryBtn = document.querySelector('.btn-primary');
    
    if(primaryBtn) {
        primaryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('¡El modo Sandbox está activo! Ve a Telegram y dale instrucciones al Hub Agent para modificar esta página.');
        });
    }

    // Add a simple parallax effect to the blobs
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        const blobs = document.querySelectorAll('.blob');
        blobs.forEach((blob, index) => {
            const speed = (index + 1) * 20;
            const x = (window.innerWidth / 2 - e.pageX) / speed;
            const y = (window.innerHeight / 2 - e.pageY) / speed;
            blob.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
});
