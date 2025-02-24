class TaskHouseApp {
    constructor() {
        this.initializeApp();
    }

    initializeApp() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeAOS();
            this.setupNavigation();
            this.setupMobileMenu();
            this.initializeAttendanceModal();
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

    initializeAttendanceModal() {
        const clockIcon = document.querySelector('.header-icons .fa-clock').parentElement;
        const modal = document.getElementById('advancedAttendanceModal');
        const overlay = document.getElementById('attendanceModalOverlay');

        // Show modal when clock icon is clicked
        clockIcon.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
            overlay.classList.add('active');
            if (!this.attendanceSystem) {
                this.attendanceSystem = new AdvancedAttendanceSystem();
            }
        });

        // Close modal when overlay is clicked
        overlay.addEventListener('click', () => {
            modal.classList.remove('active');
            overlay.classList.remove('active');
        });

        // Close modal with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modal.classList.remove('active');
                overlay.classList.remove('active');
            }
        });
    }
}

class AdvancedAttendanceSystem {
    constructor() {
        this.state = {
            isWorking: false,
            isOnBreak: false,
            startTime: null,
            breakStartTime: null,
            totalWorkTime: 0,
            totalBreakTime: 0,
            dailyGoal: 8 * 60 * 60 * 1000,
            lastActivity: new Date(),
            weeklyStats: new Array(7).fill(0)
        };

        this.charts = {};
        this.initializeSystem();
    }

    initializeSystem() {
        this.initializeElements();
        this.setupEventListeners();
        this.initializeCharts();
        this.loadSavedState();
        this.startPeriodicUpdates();
        this.setupIdleDetection();
    }

    initializeElements() {
        this.elements = {
            timeDisplay: document.querySelector('.current-time'),
            dateDisplay: document.querySelector('.current-date'),
            progressRing: document.querySelector('.progress-ring'),
            timeWorked: document.querySelector('.time-worked'),
            progressPercentage: document.querySelector('.progress-percentage'),
            startWorkBtn: document.querySelector('.start-work'),
            takeBreakBtn: document.querySelector('.take-break'),
            statusIndicator: document.querySelector('.status-indicator'),
            productivityChart: document.getElementById('productivityChart'),
            weeklyChart: document.getElementById('weeklyChart')
        };
    }

    setupEventListeners() {
        this.elements.startWorkBtn.addEventListener('click', () => this.toggleWork());
        this.elements.takeBreakBtn.addEventListener('click', () => this.toggleBreak());
        
        // Track user activity
        ['mousemove', 'keydown', 'click'].forEach(event => {
            document.addEventListener(event, () => this.updateLastActivity());
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }

    initializeCharts() {
        // Productivity Chart
        this.charts.productivity = new Chart(this.elements.productivityChart, {
            type: 'line',
            data: {
                labels: Array.from({length: 12}, (_, i) => `${i * 2}:00`),
                datasets: [{
                    label: 'Productivity',
                    data: Array(12).fill(0),
                    borderColor: '#2563eb',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });

        // Weekly Hours Chart
        this.charts.weekly = new Chart(this.elements.weeklyChart, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Hours Worked',
                    data: this.state.weeklyStats,
                    backgroundColor: '#2563eb'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    toggleWork() {
        if (!this.state.isWorking) {
            this.startWork();
        } else {
            this.endWork();
        }
    }

    startWork() {
        this.state.isWorking = true;
        this.state.startTime = new Date();
        this.updateUI('working');
        this.startProgressAnimation();
    }

    endWork() {
        this.state.isWorking = false;
        this.calculateTotalTime();
        this.updateUI('ended');
        this.updateWeeklyStats();
        this.saveState();
    }

    toggleBreak() {
        if (!this.state.isOnBreak) {
            this.startBreak();
        } else {
            this.endBreak();
        }
    }

    startBreak() {
        this.state.isOnBreak = true;
        this.state.breakStartTime = new Date();
        this.updateUI('break');
    }

    endBreak() {
        this.state.isOnBreak = false;
        this.calculateBreakTime();
        this.updateUI('working');
    }

    calculateTotalTime() {
        if (this.state.startTime) {
            const endTime = new Date();
            this.state.totalWorkTime += endTime - this.state.startTime;
        }
    }

    updateProgressAnimation() {
        const progress = (this.state.totalWorkTime / this.state.dailyGoal) * 100;
        const circumference = 283; // 2 * π * 45 (circle radius)
        const offset = circumference - (progress / 100) * circumference;
        
        this.elements.progressRing.style.strokeDashoffset = offset;
        this.elements.progressPercentage.textContent = `${Math.min(100, Math.round(progress))}%`;
    }

    updateLastActivity() {
        this.state.lastActivity = new Date();
    }

    saveState() {
        localStorage.setItem('attendanceState', JSON.stringify(this.state));
    }

    loadSavedState() {
        const saved = localStorage.getItem('attendanceState');
        if (saved) {
            this.state = { ...this.state, ...JSON.parse(saved) };
            this.updateUI(this.state.isWorking ? 'working' : 'ended');
        }
    }

    startPeriodicUpdates() {
        setInterval(() => {
            this.updateClock();
            if (this.state.isWorking) {
                this.calculateTotalTime();
                this.updateProgressAnimation();
                this.checkIdleStatus();
            }
        }, 1000);
    }

    updateClock() {
        const now = new Date();
        this.elements.timeDisplay.textContent = now.toLocaleTimeString();
        this.elements.dateDisplay.textContent = now.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    }

    checkIdleStatus() {
        const idleThreshold = 5 * 60 * 1000; // 5 minutes
        const timeSinceLastActivity = new Date() - this.state.lastActivity;
        
        if (timeSinceLastActivity > idleThreshold) {
            this.state.productivityScore = Math.max(0, this.state.productivityScore - 5);
            this.suggestBreak();
        }
    }

    suggestBreak() {
        // Show break suggestion notification
        const notification = document.createElement('div');
        notification.className = 'break-suggestion';
        notification.innerHTML = `
            <i class="fas fa-coffee"></i>
            <p>Time for a break? You've been inactive for a while.</p>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    updateUI(state) {
        // Implement UI update logic based on the current state
    }

    calculateBreakTime() {
        // Implement break time calculation logic
    }

    getActiveTime() {
        // Implement active time calculation logic
        return 0; // Placeholder return, actual implementation needed
    }

    updateProductivityChart() {
        // Implement productivity chart update logic
    }

    updateWeeklyStats() {
        // Implement weekly stats update logic
    }
}

// Initialize only once
const app = new TaskHouseApp();


