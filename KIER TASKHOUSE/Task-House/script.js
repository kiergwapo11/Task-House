class TaskHouseApp {
    constructor() {
        this.initializeApp();
    }

    initializeApp() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeAOS();
            this.setupNavigation();
            this.setupMobileMenu();
            this.initializeModals();
            this.initializeAttendance();
            this.setupTaskFeatures();
        });
    }

    initializeAOS() {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100
        });
    }

    setupNavigation() {
        const welcomeSection = document.querySelector('.main-container');
        const taskSection = document.querySelector('.task-workspace');
        const navLinks = document.querySelectorAll('.nav a');

        taskSection.style.display = 'none';

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href === '#') return;

                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                const targetId = href.replace('#', '');
                welcomeSection.style.display = targetId === 'welcome' ? 'block' : 'none';
                taskSection.style.display = targetId === 'tasks' ? 'block' : 'none';

                if (targetId === 'tasks') {
                    this.initializeTaskPage();
                }
            });
        });
    }

    setupMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);

        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 992) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    initializeModals() {
        const clockIcon = document.querySelector('.header-icons .fa-clock').parentElement;
        const attendanceModal = document.getElementById('attendanceModal');
        const modalOverlay = document.querySelector('.modal-overlay');

        // Show modal
        clockIcon.addEventListener('click', (e) => {
            e.preventDefault();
            modalOverlay.style.display = 'block';
            attendanceModal.style.display = 'block';
            // Small delay to ensure display is set before adding show class
            requestAnimationFrame(() => {
                attendanceModal.classList.add('show');
            });
        });

        // Close modal when clicking overlay
        modalOverlay.addEventListener('click', () => {
            attendanceModal.classList.remove('show');
            setTimeout(() => {
                modalOverlay.style.display = 'none';
                attendanceModal.style.display = 'none';
            }, 300); // Match the transition duration
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && attendanceModal.style.display === 'block') {
                attendanceModal.classList.remove('show');
                setTimeout(() => {
                    modalOverlay.style.display = 'none';
                    attendanceModal.style.display = 'none';
                }, 300);
            }
        });
    }

    initializeAttendance() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    updateClock() {
        const clockElement = document.querySelector('.digital-clock');
        const dateElement = document.querySelector('.current-date');
        
        if (!clockElement || !dateElement) return;

        const now = new Date();
        
        // Update time
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        clockElement.textContent = timeString;

        // Update date
        const dateString = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        dateElement.textContent = dateString;
    }

    setupTaskFeatures() {
        // Initialize task-related features
        this.setupFilters();
        this.setupSearch();
        this.updateTaskCounters();
    }

    setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // Add your filter logic here
            });
        });
    }

    setupSearch() {
        const searchInput = document.querySelector('.search-box input');
        let searchTimer;

        searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                const searchTerm = e.target.value.toLowerCase();
                // Add your search logic here
            }, 300);
        });
    }

    updateTaskCounters() {
        const taskElements = {
            total: document.querySelectorAll('.task-row'),
            completed: document.querySelectorAll('.status-badge.completed'),
            pending: document.querySelectorAll('.status-badge.pending')
        };

        const stats = {
            total: taskElements.total.length,
            completed: taskElements.completed.length,
            pending: taskElements.pending.length
        };

        // Update counters in the UI
        const elements = {
            active: document.querySelector('.active-tasks'),
            completed: document.querySelector('.completed-tasks'),
            pending: document.querySelector('.pending-tasks'),
            productivity: document.querySelector('.productivity')
        };

        if (elements.active) elements.active.textContent = stats.total - stats.completed;
        if (elements.completed) elements.completed.textContent = stats.completed;
        if (elements.pending) elements.pending.textContent = stats.pending;
        
        if (elements.productivity && stats.total > 0) {
            const productivity = (stats.completed / stats.total) * 100;
            elements.productivity.textContent = `${Math.round(productivity)}%`;
        }
    }
}

class AttendanceTracker {
    constructor() {
        this.workStartTime = null;
        this.breakStartTime = null;
        this.totalWorkTime = 0;
        this.totalBreakTime = 0;
        this.status = 'not-working'; // 'working', 'break'
    }

    startWork() {
        this.workStartTime = new Date();
        this.status = 'working';
        this.updateUI();
        this.addTimelineEntry('Started working');
    }

    startBreak() {
        this.breakStartTime = new Date();
        this.status = 'break';
        this.updateUI();
        this.addTimelineEntry('Started break');
    }

    endBreak() {
        const breakDuration = (new Date() - this.breakStartTime) / 1000 / 60; // in minutes
        this.totalBreakTime += breakDuration;
        this.breakStartTime = null;
        this.status = 'working';
        this.updateUI();
        this.addTimelineEntry('Ended break');
    }

    updateUI() {
        // Update status indicators and time displays
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');
        
        switch(this.status) {
            case 'working':
                statusDot.className = 'status-dot active';
                statusText.textContent = 'Working';
                break;
            case 'break':
                statusDot.className = 'status-dot break';
                statusText.textContent = 'On Break';
                break;
            default:
                statusDot.className = 'status-dot';
                statusText.textContent = 'Not Working';
        }
    }
}

class BreakReminder {
    constructor(workDuration = 50) { // minutes
        this.workDuration = workDuration * 60 * 1000; // convert to milliseconds
        this.timer = null;
    }

    start() {
        this.timer = setTimeout(() => {
            this.showReminder();
        }, this.workDuration);
    }

    showReminder() {
        const notification = document.createElement('div');
        notification.className = 'break-reminder';
        notification.innerHTML = `
            <i class="fas fa-coffee"></i>
            <p>Time for a break! You've been working for ${this.workDuration/60000} minutes.</p>
            <button class="remind-later">Remind me later</button>
            <button class="take-break">Take Break</button>
        `;
        document.body.appendChild(notification);
    }
}

class AttendanceNotifications {
    static async requestPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }
        
        return await Notification.requestPermission();
    }

    static sendNotification(title, options = {}) {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                icon: '/path/to/icon.png',
                badge: '/path/to/badge.png',
                ...options
            });
        }
    }
}

class OfflineAttendance {
    constructor() {
        this.db = null;
        this.initDB();
    }

    async initDB() {
        this.db = await openDB('attendance', 1, {
            upgrade(db) {
                db.createObjectStore('records', { keyPath: 'timestamp' });
            }
        });
    }

    async saveRecord(record) {
        await this.db.add('records', {
            ...record,
            timestamp: new Date().toISOString()
        });
    }

    async syncRecords() {
        // Sync with server when online
        if (navigator.onLine) {
            const records = await this.db.getAll('records');
            // Send to server
            // Clear local records after successful sync
        }
    }
}

class AttendanceSystem {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
        this.startClock();
    }

    initializeElements() {
        this.clockIcon = document.querySelector('.header-icons .fa-clock').parentElement;
        this.modal = document.querySelector('.attendance-modal');
        this.overlay = document.querySelector('.modal-overlay');
        this.mainContent = document.querySelector('.main-container'); // Main content container
        this.header = document.querySelector('.header'); // Header
        this.sidebar = document.querySelector('.sidebar'); // Sidebar
    }

    initializeEventListeners() {
        // Toggle modal
        this.clockIcon.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleModal(true);
        });

        // Close modal on overlay click
        this.overlay.addEventListener('click', () => {
            this.toggleModal(false);
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.toggleModal(false);
            }
        });

        // Clock In/Out button
        this.clockInBtn.addEventListener('click', () => this.toggleWork());

        // Break button
        this.breakBtn.addEventListener('click', () => this.toggleBreak());
    }

    toggleModal(show) {
        this.modal.style.display = show ? 'block' : 'none';
        this.overlay.style.display = show ? 'block' : 'none';
        
        // Toggle blur on main content, header, and sidebar
        [this.mainContent, this.header, this.sidebar].forEach(element => {
            if (element) {
                element.classList.toggle('blur-background', show);
            }
        });

        if (show) {
            requestAnimationFrame(() => {
                this.modal.classList.add('show');
            });
        } else {
            this.modal.classList.remove('show');
        }
    }

    startClock() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    updateClock() {
        const now = new Date();
        
        // Update digital clock
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        this.clockDisplay.textContent = `${hours}:${minutes}:${seconds}`;

        // Update date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        this.dateDisplay.textContent = now.toLocaleDateString('en-US', options);
    }

    toggleWork() {
        const isWorking = this.clockInBtn.classList.contains('active');
        if (isWorking) {
            this.clockInBtn.textContent = 'Clock In';
            this.clockInBtn.classList.remove('active');
            this.breakBtn.disabled = true;
            this.addTimelineEntry('Clocked Out');
        } else {
            this.clockInBtn.textContent = 'Clock Out';
            this.clockInBtn.classList.add('active');
            this.breakBtn.disabled = false;
            this.addTimelineEntry('Clocked In');
        }
    }

    toggleBreak() {
        const isOnBreak = this.breakBtn.classList.contains('active');
        if (isOnBreak) {
            this.breakBtn.textContent = 'Take Break';
            this.breakBtn.classList.remove('active');
            this.addTimelineEntry('Returned from Break');
        } else {
            this.breakBtn.textContent = 'End Break';
            this.breakBtn.classList.add('active');
            this.addTimelineEntry('Started Break');
        }
    }

    addTimelineEntry(action) {
        const timeline = document.querySelector('.timeline-container');
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const entry = document.createElement('div');
        entry.className = 'timeline-item';
        entry.innerHTML = `
            <div class="timeline-time">${time}</div>
            <div class="timeline-action">${action}</div>
        `;
        
        timeline.insertBefore(entry, timeline.firstChild);
    }
}

// Initialize the application
const app = new TaskHouseApp();

// Initialize the attendance system
document.addEventListener('DOMContentLoaded', () => {
    const attendance = new AttendanceSystem();
});


