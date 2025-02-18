// Initialize AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });

    // Get sidebar links with specific href values
    const welcomeLink = document.querySelector('a[href="#welcome"]');
    const tasksLink = document.querySelector('a[href="#tasks"]');
    
    // Get containers
    const welcomeContainer = document.querySelector('.main-container');
    const taskContainer = document.querySelector('.task-container');

    // Initially show welcome and hide tasks
    welcomeContainer.style.display = 'block';
    taskContainer.style.display = 'none';

    // Add click handlers
    tasksLink.addEventListener('click', function(e) {
        e.preventDefault();
        welcomeContainer.style.display = 'none';
        taskContainer.style.display = 'block';
        // Update active state
        welcomeLink.classList.remove('active');
        tasksLink.classList.add('active');
    });

    welcomeLink.addEventListener('click', function(e) {
        e.preventDefault();
        welcomeContainer.style.display = 'block';
        taskContainer.style.display = 'none';
        // Update active state
        tasksLink.classList.remove('active');
        welcomeLink.classList.add('active');
    });

    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const body = document.body;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    body.appendChild(overlay);

    // Toggle sidebar
    mobileMenuBtn.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    });

    // Close sidebar when clicking overlay
    overlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        body.style.overflow = '';
    });

    // Close sidebar on window resize if screen becomes large
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            body.style.overflow = '';
        }
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

// Settings dropdown toggle
const settingsBtn = document.querySelector('.settings-btn');
const settingsDropdown = document.querySelector('.settings-dropdown');

settingsBtn?.addEventListener('click', function(e) {
    e.stopPropagation();
    settingsDropdown.classList.toggle('active');
});

// Close dropdown when clicking outside
document.addEventListener('click', function() {
    settingsDropdown?.classList.remove('active');
});

// Add Task Modal functionality
document.addEventListener('DOMContentLoaded', function() {
    const addTaskBtn = document.querySelector('.add-task');
    const addTaskModal = document.getElementById('addTaskModal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const addTaskForm = document.getElementById('addTaskForm');

    // Debug log to check if elements are found
    console.log('Add Task Button:', addTaskBtn);
    console.log('Modal:', addTaskModal);

    // Open modal - using regular function to ensure proper binding
    addTaskBtn.addEventListener('click', function() {
        console.log('Add Task clicked'); // Debug log
        addTaskModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Close modal function
    function closeModal() {
        console.log('Closing modal'); // Debug log
        addTaskModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Close modal events
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Close on outside click
    addTaskModal.addEventListener('click', function(e) {
        if (e.target === addTaskModal) {
            closeModal();
        }
    });

    // Form submission
    addTaskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // Add your form submission logic here
        closeModal();
    });
});

