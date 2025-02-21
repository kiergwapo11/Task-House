// Initialize AOS (Animate On Scroll)
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });

    // Page routing
    const welcomeSection = document.querySelector('.main-container');
    const taskSection = document.querySelector('.task-workspace');
    const navLinks = document.querySelectorAll('.nav a');

    // Initially hide task section
    taskSection.style.display = 'none';

    // Handle navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show/hide sections
            if (target === 'welcome') {
                welcomeSection.style.display = 'block';
                taskSection.style.display = 'none';
            } else if (target === 'tasks') {
                welcomeSection.style.display = 'none';
                taskSection.style.display = 'block';
            }
        });
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
    initializeModals();
    initializeTaskFilters();
    initializeCheckboxes();
    initializeTaskActions();
    initializeComments();
    initializeAttachments();
    
    // Task Counter Updates
    updateTaskCounters();

    // Initialize task page features only when needed
    function initializeTaskPage() {
        setupTableSorting();
        setupSearch();
        setupActionButtons();
        setupFilters();
        updateTaskCounters();
        initializeModals();
        // ... other task-specific initializations
    }

    // Call initialization when switching to tasks page
    document.querySelector('a[href="#tasks"]').addEventListener('click', () => {
        initializeTaskPage();
    });

    // Initialize advanced features
    const taskManager = new TaskManager();
    const uiManager = new UIManager();
    
    class TaskManager {
        constructor() {
            this.tasks = [];
            this.columns = ['todo', 'inProgress', 'completed'];
            this.init();
        }

        init() {
            this.loadTasks();
            this.initializeEventListeners();
            this.setupDragAndDrop();
            this.updateProgress();
            this.setupSearchShortcut();
        }

        loadTasks() {
            // Sample tasks - replace with API call in production
            this.tasks = [
                {
                    id: 'task1',
                    title: 'Website Redesign',
                    description: 'Update homepage layout',
                    status: 'todo',
                    priority: 'high',
                    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
                    category: 'design'
                },
                {
                    id: 'task2',
                    title: 'Team Meeting',
                    description: 'Weekly sync with dev team',
                    status: 'todo',
                    priority: 'medium',
                    dueDate: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
                    category: 'meeting'
                }
            ];
            this.renderTasks();
        }

        initializeEventListeners() {
            // Add Task Button
            document.querySelector('.add-task').addEventListener('click', () => {
                this.showAddTaskModal();
            });

            // Search Input
            const searchInput = document.querySelector('.search-box input');
            searchInput.addEventListener('input', (e) => {
                this.searchTasks(e.target.value);
            });

            // Task Item Interactions
            document.querySelectorAll('.task-item').forEach(task => {
                this.setupTaskInteractions(task);
            });
        }

        setupDragAndDrop() {
            this.columns.forEach(columnId => {
                const column = document.querySelector(`#${columnId}List`);
                new Sortable(column, {
                    group: 'tasks',
                    animation: 150,
                    ghostClass: 'task-ghost',
                    dragClass: 'task-drag',
                    onEnd: (evt) => {
                        this.handleTaskMove(evt);
                    }
                });
            });
        }

        setupTaskInteractions(taskElement) {
            // Double click to edit
            taskElement.addEventListener('dblclick', () => {
                this.showEditTaskModal(taskElement.dataset.taskId);
            });

            // Priority toggle
            const priorityBtn = taskElement.querySelector('.priority-toggle');
            if (priorityBtn) {
                priorityBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleTaskPriority(taskElement.dataset.taskId);
                });
            }
        }

        setupSearchShortcut() {
            document.addEventListener('keydown', (e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                    e.preventDefault();
                    document.querySelector('.search-box input').focus();
                }
            });
        }

        updateProgress() {
            const total = this.tasks.length;
            const completed = this.tasks.filter(task => task.status === 'completed').length;
            const percent = Math.round((completed / total) * 100) || 0;

            // Update progress bar
            const progressFill = document.querySelector('.progress-fill');
            const progressPercent = document.querySelector('.progress-percent');
            
            if (progressFill && progressPercent) {
                progressFill.style.width = `${percent}%`;
                progressPercent.textContent = `${percent}%`;
            }

            // Update stats
            document.querySelector('.progress-stats').innerHTML = `
                <span>${completed} completed</span>
                <span>${total - completed} remaining</span>
            `;
        }

        searchTasks(query) {
            const normalizedQuery = query.toLowerCase();
            document.querySelectorAll('.task-item').forEach(task => {
                const title = task.querySelector('h3').textContent.toLowerCase();
                const description = task.querySelector('p').textContent.toLowerCase();
                const isMatch = title.includes(normalizedQuery) || 
                               description.includes(normalizedQuery);
                
                task.style.display = isMatch ? 'block' : 'none';
            });
        }

        handleTaskMove(evt) {
            const taskId = evt.item.dataset.taskId;
            const newStatus = evt.to.id.replace('List', '');
            
            // Update task status in data
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                task.status = newStatus;
                this.updateProgress();
                this.saveTasksToStorage();
            }
        }

        formatDueDate(date) {
            const now = new Date();
            const diff = date - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            
            if (hours < 24) {
                return hours <= 1 ? '1 hour left' : `${hours} hours left`;
            }
            return new Date(date).toLocaleDateString();
        }

        createTaskElement(task) {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.priority}-priority`;
            taskElement.dataset.taskId = task.id;
            
            taskElement.innerHTML = `
                <div class="task-content">
                    <h3>${task.title}</h3>
                    <p>${task.description}</p>
                </div>
                <div class="task-meta">
                    <span class="due">${this.formatDueDate(task.dueDate)}</span>
                    <span class="tag ${task.category}">${task.category}</span>
                </div>
            `;

            this.setupTaskInteractions(taskElement);
            return taskElement;
        }

        renderTasks() {
            this.columns.forEach(status => {
                const columnTasks = this.tasks.filter(task => task.status === status);
                const column = document.querySelector(`#${status}List`);
                if (column) {
                    column.innerHTML = '';
                    columnTasks.forEach(task => {
                        column.appendChild(this.createTaskElement(task));
                    });
                }
            });
            this.updateProgress();
        }

        // Storage methods
        saveTasksToStorage() {
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
        }

        loadTasksFromStorage() {
            const stored = localStorage.getItem('tasks');
            if (stored) {
                this.tasks = JSON.parse(stored);
                this.tasks.forEach(task => {
                    task.dueDate = new Date(task.dueDate);
                });
                this.renderTasks();
            }
        }
    }

    class UIManager {
        constructor() {
            this.initializeAnimations();
            this.initializeCharts();
            this.setupResponsiveLayout();
        }

        initializeAnimations() {
            // Enhanced animations
            gsap.from('.task-card', {
                duration: 0.6,
                y: 20,
                opacity: 0,
                stagger: 0.1,
                ease: 'power2.out'
            });

            // Smooth state transitions
            this.initializeStateTransitions();
        }

        initializeCharts() {
            // Task distribution chart
            const ctx = document.querySelector('.task-distribution-chart');
            if (ctx) {
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Completed', 'In Progress', 'Pending'],
                        datasets: [{
                            data: [30, 45, 25],
                            backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
                        }]
                    },
                    options: {
                        cutout: '75%',
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            }
        }
    }

    class TaskDashboard {
        constructor() {
            this.initializeDashboard();
            this.setupEventListeners();
        }

        initializeDashboard() {
            // Initialize task counts
            this.updateTaskCounts({
                total: 0,
                inProgress: 5,
                completed: 7
            });
        }

        updateTaskCounts(counts) {
            document.querySelector('[data-stat="total"] .stat-number').textContent = counts.total;
            document.querySelector('[data-stat="in-progress"] .stat-number').textContent = counts.inProgress;
            document.querySelector('[data-stat="completed"] .stat-number').textContent = counts.completed;
        }

        setupEventListeners() {
            // Filter buttons
            const filterButtons = document.querySelectorAll('.filter-btn');
            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                });
            });

            // Search functionality
            const searchInput = document.querySelector('.search-input');
            searchInput.addEventListener('input', (e) => {
                // Implement search logic here
            });
        }
    }

    // Initialize dashboard
    const dashboard = new TaskDashboard();
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

// Modal Handling
function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    const openModalBtns = document.querySelectorAll('[data-modal-target]');
    const closeModalBtns = document.querySelectorAll('.close-modal');

    openModalBtns.forEach(button => {
        button.addEventListener('click', () => {
            const modal = document.querySelector(button.dataset.modalTarget);
            openModal(modal);
        });
    });

    closeModalBtns.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });

    function openModal(modal) {
        if (modal == null) return;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        if (modal == null) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Task Filtering
function initializeTaskFilters() {
    const categoryChips = document.querySelectorAll('.chip');
    const taskRows = document.querySelectorAll('.task-row');
    const searchInput = document.querySelector('.search-box input');

    categoryChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // Remove active class from all chips
            categoryChips.forEach(c => c.classList.remove('active'));
            // Add active class to clicked chip
            chip.classList.add('active');
            
            const category = chip.textContent.toLowerCase();
            filterTasks(category);
        });
    });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterTasksBySearch(searchTerm);
    });

    function filterTasks(category) {
        taskRows.forEach(row => {
            const taskCategory = row.querySelector('.category-dot').classList[1];
            if (category === 'all' || taskCategory === category) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    function filterTasksBySearch(searchTerm) {
        taskRows.forEach(row => {
            const taskName = row.querySelector('.task-name-cell span').textContent.toLowerCase();
            if (taskName.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
}

// Checklist Functionality
function initializeCheckboxes() {
    const checklistItems = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    
    checklistItems.forEach(item => {
        item.addEventListener('change', () => {
            updateProgress();
        });
    });

    function updateProgress() {
        const total = checklistItems.length;
        const checked = document.querySelectorAll('.checklist-item input[type="checkbox"]:checked').length;
        const percentage = (checked / total) * 100;
        
        const progressBar = document.querySelector('.progress');
        progressBar.style.width = `${percentage}%`;
        progressBar.querySelector('span').textContent = `${Math.round(percentage)}%`;
    }
}

// Comment System
function initializeComments() {
    const commentForm = document.querySelector('.comment-form');
    const commentsContainer = document.querySelector('.comments-section');

    if (commentForm) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addNewComment(e.target.elements.comment.value);
            e.target.reset();
        });
    }

    function addNewComment(content) {
        const comment = createCommentElement(content);
        commentsContainer.insertBefore(comment, commentsContainer.firstChild);
    }

    function createCommentElement(content) {
        const comment = document.createElement('div');
        comment.className = 'comment fade-in';
        comment.innerHTML = `
            <div class="comment-header">
                <img src="avatar1.jpg" alt="User">
                <span class="comment-author">You</span>
                <span class="comment-time">Just now</span>
            </div>
            <div class="comment-content">
                <p>${content}</p>
            </div>
        `;
        return comment;
    }
}

// File Attachments
function initializeAttachments() {
    const fileInput = document.querySelector('.attachment-input');
    const attachmentsList = document.querySelector('.attachment-grid');

    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }

    function handleFileUpload(e) {
        const files = e.target.files;
        Array.from(files).forEach(file => {
            addAttachment(file);
        });
    }

    function addAttachment(file) {
        const attachment = document.createElement('div');
        attachment.className = 'attachment-item fade-in';
        attachment.innerHTML = `
            <i class="fas fa-file"></i>
            <span>${file.name}</span>
            <button class="download-btn">
                <i class="fas fa-download"></i>
            </button>
        `;
        attachmentsList.appendChild(attachment);
    }
}

// Task Counter Updates
function updateTaskCounters() {
    const totalTasks = document.querySelectorAll('.task-row').length;
    const completedTasks = document.querySelectorAll('.status-badge.completed').length;
    const pendingTasks = document.querySelectorAll('.status-badge.pending').length;
    
    // Update stats
    document.querySelector('.active-tasks').textContent = totalTasks - completedTasks;
    document.querySelector('.completed-tasks').textContent = completedTasks;
    document.querySelector('.pending-tasks').textContent = pendingTasks;
    
    // Update productivity
    const productivity = (completedTasks / totalTasks) * 100;
    document.querySelector('.productivity').textContent = `${Math.round(productivity)}%`;
}

// Assignee Functionality
function toggleAssigneeDropdown(trigger) {
    const wrapper = trigger.closest('.assignee-wrapper');
    wrapper.classList.toggle('active');

    // Close other open dropdowns
    document.querySelectorAll('.assignee-wrapper.active').forEach(item => {
        if (item !== wrapper) {
            item.classList.remove('active');
        }
    });
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.assignee-wrapper')) {
        document.querySelectorAll('.assignee-wrapper.active').forEach(wrapper => {
            wrapper.classList.remove('active');
        });
    }
});

// Search functionality
document.querySelectorAll('.search-member input').forEach(input => {
    input.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const members = e.target.closest('.assignee-dropdown').querySelectorAll('.member-item');
        
        members.forEach(member => {
            const name = member.querySelector('span').textContent.toLowerCase();
            if (name.includes(searchTerm)) {
                member.style.display = 'flex';
            } else {
                member.style.display = 'none';
            }
        });
    });
});

// Member selection
document.querySelectorAll('.member-item').forEach(member => {
    member.addEventListener('click', () => {
        const wrapper = member.closest('.assignee-wrapper');
        const trigger = wrapper.querySelector('.assignee-trigger');
        const img = member.querySelector('img').cloneNode(true);
        const name = member.querySelector('span').textContent;

        // Update trigger content
        trigger.querySelector('.avatar-stack').innerHTML = '';
        trigger.querySelector('.avatar-stack').appendChild(img);
        trigger.querySelector('.avatar-stack').innerHTML += `<span class="assignee-name">${name}</span>`;

        // Update active state
        member.closest('.team-members').querySelectorAll('.member-item').forEach(m => {
            m.classList.remove('active');
        });
        member.classList.add('active');

        // Close dropdown
        wrapper.classList.remove('active');
    });
});

class AttendanceSystem {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.setupState();
    }

    initializeElements() {
        // Get all necessary DOM elements
        this.attendanceBtn = document.querySelector('.header-icons .icon .fa-clock').parentElement;
        this.modal = document.querySelector('.attendance-modal');
        this.closeBtn = document.getElementById('closeAttendanceBtn');
        this.clockBtn = document.getElementById('clockBtn');
        this.breakBtn = document.getElementById('breakBtn');
        this.tableBody = document.querySelector('.table-body');
        
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        document.body.appendChild(this.overlay);

        // Debug
        console.log('Attendance Button:', this.attendanceBtn);
        console.log('Modal:', this.modal);
    }

    setupEventListeners() {
        // Open modal on attendance icon click
        if (this.attendanceBtn) {
            this.attendanceBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Attendance button clicked');
                this.openModal();
            });
        }

        // Close modal handlers
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Overlay click to close
        this.overlay.addEventListener('click', () => this.closeModal());

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });

        // Clock button handler
        if (this.clockBtn) {
            this.clockBtn.addEventListener('click', () => this.handleClockAction());
        }

        // Break button handler
        if (this.breakBtn) {
            this.breakBtn.addEventListener('click', () => this.handleBreakAction());
        }
    }

    openModal() {
        console.log('Opening attendance modal');
        if (this.modal && this.overlay) {
            this.modal.style.display = 'block';
            this.overlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
            this.updateDisplay();
        }
    }

    closeModal() {
        console.log('Closing attendance modal');
        if (this.modal && this.overlay) {
            this.modal.style.display = 'none';
            this.overlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    setupState() {
        this.isClockIn = true;
        this.isOnBreak = false;
        this.attendanceData = this.loadAttendanceData();
        this.currentSession = null;
    }

    updateDisplay() {
        // Update attendance table and stats
        this.renderAttendanceTable();
        this.updateStats();
    }

    handleClockAction() {
        const now = new Date();
        if (this.isClockIn) {
            // Clock In
            this.clockIn(now);
        } else {
            // Clock Out
            this.clockOut(now);
        }
        this.updateDisplay();
    }

    clockIn(time) {
        this.currentSession = {
            date: time.toLocaleDateString(),
            clockIn: time.toLocaleTimeString(),
            clockOut: null,
            breakTime: '00:00',
            totalHours: '00:00',
            status: 'Present'
        };
        this.attendanceData.push(this.currentSession);
        this.isClockIn = false;
        this.clockBtn.innerHTML = '<i class="fas fa-clock"></i> Clock Out';
        this.breakBtn.disabled = false;
    }

    clockOut(time) {
        if (this.currentSession) {
            this.currentSession.clockOut = time.toLocaleTimeString();
            this.currentSession.totalHours = this.calculateHours(this.currentSession);
            this.isClockIn = true;
            this.clockBtn.innerHTML = '<i class="fas fa-clock"></i> Clock In';
            this.breakBtn.disabled = true;
            this.saveAttendanceData();
        }
    }

    loadAttendanceData() {
        const saved = localStorage.getItem('attendanceData');
        return saved ? JSON.parse(saved) : [];
    }

    saveAttendanceData() {
        localStorage.setItem('attendanceData', JSON.stringify(this.attendanceData));
    }

    calculateHours(session) {
        // Add time calculation logic here
        return '8:00'; // Placeholder
    }

    renderAttendanceTable() {
        if (!this.tableBody) return;
        
        this.tableBody.innerHTML = this.attendanceData.map((record, index) => `
            <div class="table-row">
                <div>${index + 1}</div>
                <div>${record.date}</div>
                <div>${record.clockIn}</div>
                <div>${record.clockOut || '--:--'}</div>
                <div>${record.breakTime}</div>
                <div>${record.totalHours}</div>
                <div class="status ${record.status.toLowerCase()}">${record.status}</div>
                <div class="actions">
                    <button class="action-btn"><i class="fas fa-ellipsis-v"></i></button>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        // Update statistics display
        const stats = this.calculateStats();
        document.getElementById('presentCount').textContent = stats.presentDays;
        document.getElementById('workingHours').textContent = stats.totalHours;
        document.getElementById('breakTime').textContent = stats.totalBreak;
    }

    calculateStats() {
        return {
            presentDays: this.attendanceData.length,
            totalHours: '0h',
            totalBreak: '0h'
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const attendance = new AttendanceSystem();
    // Make it globally accessible for debugging
    window.attendanceSystem = attendance;
});

