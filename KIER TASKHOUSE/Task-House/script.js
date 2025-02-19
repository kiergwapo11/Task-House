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

    updateCurrentTime();
    setupFilters();
    setupTableSorting();
    setupSearch();
    setupActionButtons();

    // Fix sidebar navigation
    const sidebarLinks = document.querySelectorAll('.nav a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            sidebarLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Handle content display
            const target = this.getAttribute('href').substring(1);
            if (target === 'welcome') {
                welcomeContainer.style.display = 'block';
                taskContainer.style.display = 'none';
            } else if (target === 'tasks') {
                welcomeContainer.style.display = 'none';
                taskContainer.style.display = 'block';
            }

            // Close sidebar on mobile after clicking
            if (window.innerWidth <= 992) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                body.style.overflow = '';
            }
        });
    });

    // Initialize clock
    updateClock();
    setInterval(updateClock, 1000);

    // Task filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterTasks(btn.dataset.filter);
        });
    });

    // Search functionality
    const searchInput = document.querySelector('.search-box input');
    let searchTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase();
            searchTasks(searchTerm);
        }, 300);
    });

    // Enhanced Functionality
    setupSmartSearch();
    
    // Enhanced Filters with Animation
    setupEnhancedFilters();
    
    // Real-time Clock with Smooth Update
    setupLiveTimer();
    
    // Interactive Table Features
    setupTableInteractions();

    // Initialize all components
    initializeClock();
    initializeFilters();
    initializeSearch();
    initializeTaskActions();
    initializeKeyboardShortcuts();
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

// Update current time
function updateCurrentTime() {
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        setInterval(() => {
            const now = new Date();
            const options = { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: true 
            };
            timeElement.textContent = now.toLocaleTimeString('en-US', options);
        }, 1000);
    }
}

// Task filtering
function setupFilters() {
    const pills = document.querySelectorAll('.filter-pills .pill');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            // Remove active class from all pills
            pills.forEach(p => p.classList.remove('active'));
            // Add active class to clicked pill
            pill.classList.add('active');
            
            // Filter tasks based on status
            const status = pill.textContent.toLowerCase();
            filterTasks(status);
        });
    });
}

// Task sorting
function setupTableSorting() {
    const headers = document.querySelectorAll('.task-table th');
    headers.forEach(header => {
        if (header.querySelector('.fas.fa-sort')) {
            header.addEventListener('click', () => {
                const column = header.textContent.trim();
                sortTable(column);
            });
        }
    });
}

// Search functionality
function setupSearch() {
    const searchInput = document.querySelector('.search-box input');
    let debounceTimer;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('.task-table tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }, 300);
    });
}

// Action button handlers
function setupActionButtons() {
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = btn.classList.contains('edit') ? 'edit' :
                          btn.classList.contains('view') ? 'view' :
                          'delete';
            
            const row = btn.closest('tr');
            const taskId = row.querySelector('td:first-child').textContent;
            
            handleTaskAction(action, taskId);
        });
    });
}

function handleTaskAction(action, taskId) {
    switch(action) {
        case 'edit':
            // Show edit modal
            console.log(`Editing task ${taskId}`);
            break;
        case 'view':
            // Show task details
            console.log(`Viewing task ${taskId}`);
            break;
        case 'delete':
            if (confirm('Are you sure you want to delete this task?')) {
                console.log(`Deleting task ${taskId}`);
            }
            break;
    }
}

// Enhanced Table Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Table Sorting
    const sortableHeaders = document.querySelectorAll('.task-table th[data-sortable]');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.column;
            sortTable(column);
        });
    });

    // Quick Edit
    const editableCells = document.querySelectorAll('.task-table td[data-editable]');
    editableCells.forEach(cell => {
        cell.addEventListener('dblclick', () => {
            makeEditable(cell);
        });
    });

    // Search Functionality
    const searchInput = document.querySelector('.search-box input');
    let searchDebounceTimer;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            searchTasks(e.target.value.toLowerCase());
        }, 300);
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'n') { // Ctrl + N
            e.preventDefault();
            openNewTaskModal();
        }
    });
});

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Loading States
function showLoading() {
    const rows = document.querySelectorAll('.task-table tbody tr');
    rows.forEach(row => {
        row.classList.add('loading-skeleton');
    });
}

function hideLoading() {
    const rows = document.querySelectorAll('.task-table tbody tr');
    rows.forEach(row => {
        row.classList.remove('loading-skeleton');
    });
}

function updateClock() {
    const timeElement = document.getElementById('currentTime');
    const now = new Date();
    timeElement.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function filterTasks(filter) {
    const tasks = document.querySelectorAll('.task-table tbody tr');
    tasks.forEach(task => {
        const status = task.querySelector('.status-badge').dataset.status;
        task.style.display = (filter === 'all' || status === filter) ? '' : 'none';
    });
}

function searchTasks(term) {
    const tasks = document.querySelectorAll('.task-table tbody tr');
    tasks.forEach(task => {
        const text = task.textContent.toLowerCase();
        task.style.display = text.includes(term) ? '' : 'none';
    });
}

function setupSmartSearch() {
    const searchInput = document.querySelector('.search-field input');
    
    // Command/Ctrl + K to focus search
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }
    });

    // Smart search with debounce
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase();
            performSmartSearch(searchTerm);
        }, 200);
    });
}

function setupEnhancedFilters() {
    const filterChips = document.querySelectorAll('.filter-chip');
    
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // Smooth transition for filter change
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            
            // Animate table during filter
            const table = document.querySelector('.task-table');
            table.style.opacity = '0.6';
            
            setTimeout(() => {
                filterTasks(chip.dataset.filter);
                table.style.opacity = '1';
            }, 200);
        });
    });
}

function setupLiveTimer() {
    const timeElement = document.getElementById('currentTime');
    
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        
        // Smooth time update
        timeElement.style.opacity = '0';
        setTimeout(() => {
            timeElement.textContent = timeString;
            timeElement.style.opacity = '1';
        }, 200);
    }
    
    updateTime();
    setInterval(updateTime, 1000);
}

function setupTableInteractions() {
    const taskRows = document.querySelectorAll('.task-row');
    
    taskRows.forEach(row => {
        // Hover effects
        row.addEventListener('mouseenter', () => {
            row.classList.add('row-hover');
        });
        
        row.addEventListener('mouseleave', () => {
            row.classList.remove('row-hover');
        });
        
        // Quick actions
        row.addEventListener('click', (e) => {
            if (e.target.closest('.action-button')) {
                handleTaskAction(e.target.closest('.action-button'), row);
            }
        });
    });
}

// Clock functionality
function initializeClock() {
    const updateTime = () => {
        const timeElement = document.getElementById('currentTime');
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };
    updateTime();
    setInterval(updateTime, 1000);
}

// Filter functionality
function initializeFilters() {
    const pills = document.querySelectorAll('.filter-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            filterTasks(pill.dataset.filter);
        });
    });
}

// Search functionality with keyboard shortcut
function initializeSearch() {
    const searchInput = document.querySelector('.search-box input');
    
    // Command/Ctrl + K shortcut
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }
    });

    // Search implementation
    let searchTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase();
            searchTasks(searchTerm);
        }, 200);
    });
}

// Task actions
function initializeTaskActions() {
    const createTaskBtn = document.querySelector('.create-task-btn');
    createTaskBtn.addEventListener('click', () => {
        // Show create task modal
        document.getElementById('addTaskModal').classList.add('active');
    });
}

// Keyboard Shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Search shortcut (Cmd/Ctrl + K)
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            document.querySelector('.smart-search').focus();
        }

        // Create task shortcut (Cmd/Ctrl + N)
        if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
            e.preventDefault();
            document.querySelector('.create-task-btn').click();
        }
    });
}

// CSS Animations
const styles = `
@keyframes numberFlip {
    0% { transform: translateY(-100%); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-10px); }
}

@keyframes slideIn {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}
`;

// Add animations to document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

