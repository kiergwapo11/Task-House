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
            this.setupSidebarMenu();
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
        // Get all sections
        const sections = {
            welcome: document.querySelector('.welcome-content'),
            attendance: document.querySelector('.attendance-modern'),
            tasks: document.querySelector('.task-page'),
            taskReports: document.querySelector('.task-reports-section'),
            vaUtilization: document.querySelector('.va-utilization-section')
        };

        // Hide all sections except welcome initially
        Object.values(sections).forEach(section => {
            if (section && section !== sections.welcome) {
                section.style.display = 'none';
            }
        });

        // Handle main navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const linkText = e.target.textContent.trim();

                // Remove active class from all links
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                
                // Hide all sections first
                Object.values(sections).forEach(section => {
                    if (section) section.style.display = 'none';
                });

                // Show appropriate section and set active class
                switch(linkText) {
                    case 'Welcome':
                        sections.welcome.style.display = 'block';
                        link.classList.add('active');
                        break;
                    case 'Attendance':
                        sections.attendance.style.display = 'block';
                        link.classList.add('active');
                        break;
                    case 'My Tasks':
                        sections.tasks.style.display = 'block';
                        link.classList.add('active');
                        break;
                }
            });
        });

        // Handle submenu links
        document.querySelectorAll('.submenu-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const linkText = e.target.closest('.submenu-link').textContent.trim();

                // Hide all sections first
                Object.values(sections).forEach(section => {
                    if (section) section.style.display = 'none';
                });

                // Show appropriate section
                if (linkText === 'Task Reports') {
                    const taskReportsSection = document.querySelector('.task-reports-section');
                    if (taskReportsSection) {
                        taskReportsSection.style.display = 'block';
                        console.log('Task Reports section displayed'); // Debug log
                    }
                } else if (linkText === 'VA Utilization') {
                    const vaUtilizationSection = document.querySelector('.va-utilization-section');
                    if (vaUtilizationSection) {
                        vaUtilizationSection.style.display = 'block';
                        console.log('VA Utilization section displayed'); // Debug log
                    }
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

    setupSidebarMenu() {
        const menuItems = document.querySelectorAll('.nav-item.has-submenu');
        
        menuItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Close other open submenus
                menuItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current submenu
                item.classList.toggle('active');
            });
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
            breakDuration: 0,
            currentRow: null,
            recordCount: 0,
            records: [],
            currentPage: 1,
            recordsPerPage: 6 // Adjusted to 6 as per your context
        };

        // Initialize buttons
        this.timeInBtn = document.getElementById('timeInBtn');
        this.breakBtn = document.getElementById('breakBtn');
        this.timeOutBtn = document.getElementById('timeOutBtn');
        this.tbody = document.getElementById('attendanceTableBody');
        this.clockDisplay = document.querySelector('.digital-time');
        this.dateDisplay = document.querySelector('.date-display');
        this.workedHoursDisplay = document.getElementById('todayHours');
        this.prevPageBtn = document.getElementById('prevPage');
        this.nextPageBtn = document.getElementById('nextPage');
        this.pageNumbers = document.getElementById('pageNumbers');

        // Add event listeners
        if (this.timeInBtn) {
            this.timeInBtn.addEventListener('click', () => this.handleTimeIn());
        } else {
            console.error('timeInBtn not found');
        }
        if (this.breakBtn) {
            this.breakBtn.addEventListener('click', () => this.handleBreak());
        } else {
            console.error('breakBtn not found');
        }
        if (this.timeOutBtn) {
            this.timeOutBtn.addEventListener('click', () => this.handleTimeOut());
        } else {
            console.error('timeOutBtn not found');
        }
        if (this.prevPageBtn) {
            this.prevPageBtn.addEventListener('click', () => this.changePage(-1));
        } else {
            console.error('prevPageBtn not found');
        }
        if (this.nextPageBtn) {
            this.nextPageBtn.addEventListener('click', () => this.changePage(1));
        } else {
            console.error('nextPageBtn not found');
        }

        // Start clock update
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);

        // Set initial button states
        if (this.breakBtn) this.breakBtn.disabled = true;
        if (this.timeOutBtn) this.timeOutBtn.disabled = true;

        // Load initial data
        this.loadInitialData();
    }

    handleTimeIn() {
        if (this.state.isWorking) return;

        const now = new Date();
        this.state.isWorking = true;
        this.state.startTime = now;
        this.state.recordCount++; // Increment record counter

        // Create record
        const record = {
            id: Date.now(),
            number: this.state.recordCount,
            date: this.formatDate(now),
            timeIn: this.formatTime(now),
            timeOut: '-',
            break: '-',
            tardiness: '0:00',
            undertime: 'Pending',
            breakTwo: '-',
            workedHours: '0:00',
            excessHours: '0:00',
            status: 'in-progress'
        };

        // Add record to state
        this.state.records.push(record);
        this.state.currentRow = record.id; // Set current row to the new record

        console.log('Record added:', record); // Debug log

        // Update table display
        this.updateTableDisplay();

        // Enable/disable buttons
        if (this.timeInBtn) this.timeInBtn.disabled = true;
        if (this.breakBtn) this.breakBtn.disabled = false;
        if (this.timeOutBtn) this.timeOutBtn.disabled = false;
    }

    handleBreak() {
        if (!this.state.isWorking) return;

        const now = new Date();
        const record = this.state.records.find(r => r.id === this.state.currentRow);

        if (!this.state.isOnBreak) {
            // Start Break
            this.state.isOnBreak = true;
            this.state.breakStartTime = now;
            if (this.breakBtn) {
                this.breakBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            }

            // Update record status to show "On Break"
            if (record) {
                record.status = 'break';
            }
        } else {
            // End Break
            this.state.isOnBreak = false;
            this.state.breakDuration += now - this.state.breakStartTime;
            if (this.breakBtn) {
                this.breakBtn.innerHTML = '<i class="fas fa-coffee"></i> Break';
            }

            // Update record to show break duration and working status
            if (record) {
                record.break = `${Math.floor(this.state.breakDuration / (1000 * 60))} min`;
                record.status = 'in-progress';
            }
        }

        // Update table display
        this.updateTableDisplay();
    }

    handleTimeOut() {
        if (!this.state.isWorking) return;

        const now = new Date();
        const record = this.state.records.find(r => r.id === this.state.currentRow);

        if (record) {
            record.timeOut = this.formatTime(now); // Time Out
            record.break = `${Math.floor(this.state.breakDuration / (1000 * 60))} min`; // Break duration
            record.workedHours = this.calculateWorkedHours(this.state.startTime, now); // Worked Hours
            record.status = 'completed';
        }

        // Reset state
        this.state.isWorking = false;
        this.state.isOnBreak = false;
        this.state.startTime = null;
        this.state.breakStartTime = null;
        this.state.breakDuration = 0;
        this.state.currentRow = null;

        // Reset buttons
        if (this.timeInBtn) this.timeInBtn.disabled = false;
        if (this.breakBtn) this.breakBtn.disabled = true;
        if (this.timeOutBtn) this.timeOutBtn.disabled = true;

        // Update table display
        this.updateTableDisplay();
    }

    updateTableDisplay() {
        if (!this.tbody) return;

        // Calculate pagination
        const startIndex = (this.state.currentPage - 1) * this.state.recordsPerPage;
        const endIndex = startIndex + this.state.recordsPerPage;
        const recordsToShow = this.state.records.slice(startIndex, endIndex);

        console.log('Displaying records:', recordsToShow); // Debug log

        // Clear current table
        this.tbody.innerHTML = '';

        // Add visible records
        recordsToShow.forEach(record => {
            const row = document.createElement('tr');
            row.id = `attendance-${record.id}`;
            row.innerHTML = `
                <td>${record.number}</td>
                <td>${record.date}</td>
                <td>${record.timeIn}</td>
                <td>${record.timeOut}</td>
                <td>${record.break}</td>
                <td>${record.tardiness}</td>
                <td>${record.undertime}</td>
                <td>${record.breakTwo}</td>
                <td>${record.workedHours}</td>
                <td>${record.excessHours}</td>
                <td><span class="status-badge ${record.status.toLowerCase()}">${record.status}</span></td>
                <td>
                    <button class="action-btn">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </td>
            `;
            this.tbody.appendChild(row);
        });

        // Update pagination controls
        this.updatePaginationControls();
    }

    updatePaginationControls() {
        const totalPages = Math.ceil(this.state.records.length / this.state.recordsPerPage);
        this.prevPageBtn.disabled = this.state.currentPage === 1;
        this.nextPageBtn.disabled = this.state.currentPage === totalPages;

        // Update page numbers display
        this.pageNumbers.textContent = `Page ${this.state.currentPage} of ${totalPages}`;
    }

    changePage(direction) {
        const totalPages = Math.ceil(this.state.records.length / this.state.recordsPerPage);
        if (direction === -1 && this.state.currentPage > 1) {
            this.state.currentPage--;
        } else if (direction === 1 && this.state.currentPage < totalPages) {
            this.state.currentPage++;
        }

        console.log('Current page:', this.state.currentPage); // Debug log

        // Update table display
        this.updateTableDisplay();
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    }

    calculateWorkedHours(start, end) {
        if (!start || !end) return '0:00';
        const diffMs = end - start - this.state.breakDuration;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }

    updateClock() {
        const now = new Date();
        if (this.clockDisplay) {
            this.clockDisplay.textContent = this.formatTime(now);
        }
        if (this.dateDisplay) {
            this.dateDisplay.textContent = this.formatDate(now);
        }
        if (this.state.isWorking && this.workedHoursDisplay) {
            const worked = this.calculateWorkedHours(this.state.startTime, now);
            this.workedHoursDisplay.textContent = worked;
        }
    }

    loadInitialData() {
        // Load initial data if any
        this.updateTableDisplay();
    }
}

// Initialize the app
const app = new TaskHouseApp();
