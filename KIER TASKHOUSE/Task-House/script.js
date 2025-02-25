class TaskHouseApp {
    constructor() {
        this.initializeApp();
        this.attendanceSystem = new AttendanceSystem();
    }

    initializeApp() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeAOS();
            this.setupNavigation();
            this.setupMobileMenu();
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
        const sections = {
            welcome: document.querySelector('.welcome-content'),
            tasks: document.querySelector('.task-workspace')
        };
        
        const navLinks = document.querySelectorAll('.nav a');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href').replace('#', '');
                
                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));
                // Add active class to clicked link
                link.classList.add('active');

                // Show/hide sections based on navigation
                if (href === 'welcome') {
                    sections.welcome.style.display = 'block';
                    sections.tasks.style.display = 'none';
                } else if (href === 'tasks') {
                    sections.welcome.style.display = 'none';
                    sections.tasks.style.display = 'block';
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
}

class AttendanceSystem {
    constructor() {
        this.state = {
            isWorking: false,
            isOnBreak: false,
            startTime: null,
            breakStartTime: null,
            breakDuration: 0
        };
        this.initializeAttendance();
    }

    initializeAttendance() {
        this.setupTimeDisplay();
        this.setupEventListeners();
        this.loadAttendanceHistory();
    }

    setupTimeDisplay() {
        const updateTime = () => {
            const now = new Date();
            const timeDisplay = document.getElementById('currentTime');
            const dateDisplay = document.getElementById('currentDate');
            
            if (timeDisplay) {
                timeDisplay.textContent = now.toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            }
            
            if (dateDisplay) {
                dateDisplay.textContent = now.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
        };

        updateTime();
        setInterval(updateTime, 1000);
    }

    setupEventListeners() {
        const timeInBtn = document.getElementById('timeInBtn');
        const breakBtn = document.getElementById('breakBtn');
        const timeOutBtn = document.getElementById('timeOutBtn');

        if (timeInBtn) {
            timeInBtn.addEventListener('click', () => this.handleTimeIn());
        }
        if (breakBtn) {
            breakBtn.addEventListener('click', () => this.handleBreak());
        }
        if (timeOutBtn) {
            timeOutBtn.addEventListener('click', () => this.handleTimeOut());
        }
    }

    handleTimeIn() {
        if (!this.state.isWorking) {
            this.state.isWorking = true;
            this.state.startTime = new Date();
            this.updateButtonStates();
            this.addAttendanceRecord('Time In');
        }
    }

    handleBreak() {
        if (this.state.isWorking && !this.state.isOnBreak) {
            this.state.isOnBreak = true;
            this.state.breakStartTime = new Date();
            this.updateButtonStates();
        } else if (this.state.isOnBreak) {
            this.state.isOnBreak = false;
            this.state.breakDuration += (new Date() - this.state.breakStartTime);
            this.updateButtonStates();
        }
    }

    handleTimeOut() {
        if (this.state.isWorking) {
            this.state.isWorking = false;
            this.state.isOnBreak = false;
            this.calculateWorkHours();
            this.updateButtonStates();
            this.addAttendanceRecord('Time Out');
        }
    }

    updateButtonStates() {
        const timeInBtn = document.getElementById('timeInBtn');
        const breakBtn = document.getElementById('breakBtn');
        const timeOutBtn = document.getElementById('timeOutBtn');

        if (timeInBtn) {
            timeInBtn.disabled = this.state.isWorking;
        }
        if (breakBtn) {
            breakBtn.disabled = !this.state.isWorking;
            breakBtn.textContent = this.state.isOnBreak ? 'End Break' : 'Start Break';
        }
        if (timeOutBtn) {
            timeOutBtn.disabled = !this.state.isWorking;
        }
    }

    calculateWorkHours() {
        const endTime = new Date();
        const totalTime = endTime - this.state.startTime - this.state.breakDuration;
        const hours = Math.floor(totalTime / (1000 * 60 * 60));
        const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));
        
        document.getElementById('todayHours').textContent = 
            `${hours}:${minutes.toString().padStart(2, '0')}`;
    }

    addAttendanceRecord(action) {
        const tbody = document.getElementById('attendanceTableBody');
        if (!tbody) return;

        const now = new Date();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${now.toLocaleDateString()}</td>
            <td>${action === 'Time In' ? now.toLocaleTimeString() : '-'}</td>
            <td>${this.state.breakDuration ? (this.state.breakDuration / (1000 * 60)).toFixed(0) + ' min' : '-'}</td>
            <td>${action === 'Time Out' ? now.toLocaleTimeString() : '-'}</td>
            <td>${action === 'Time Out' ? document.getElementById('todayHours').textContent : '-'}</td>
            <td><span class="status-badge present">Present</span></td>
        `;
        
        tbody.insertBefore(row, tbody.firstChild);
    }

    loadAttendanceHistory() {
        // Implement loading attendance history from storage
    }
}

// Initialize the app
const app = new TaskHouseApp();


