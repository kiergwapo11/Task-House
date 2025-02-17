// Initialize AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });
});

// Copy format text function
function copyFormat() {
    const text = "Referred Applicant: Position, Full Name of Applicant";
    navigator.clipboard.writeText(text)
        .then(() => {
            const btn = document.querySelector('.copy-btn');
            btn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy text to clipboard');
        });
}

// Add smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Add card interaction effects
document.querySelectorAll('.position-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.querySelector('.hover-info').style.opacity = '1';
        this.querySelector('.hover-info').style.transform = 'translateY(0)';
    });

    card.addEventListener('mouseleave', function() {
        this.querySelector('.hover-info').style.opacity = '0';
        this.querySelector('.hover-info').style.transform = 'translateY(20px)';
    });
});

// Add email link click tracking
document.querySelector('.email-link')?.addEventListener('click', function(e) {
    console.log('Email link clicked');
});

// Add apply button click handlers
document.querySelectorAll('.apply-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const position = this.closest('.position-card').querySelector('h3').textContent;
        console.log(`Applied for position: ${position}`);
    });
});
