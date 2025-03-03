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
        const sections = {
            welcome: document.querySelector('.welcome-content'),
            tasks: document.querySelector('.task-workspace'),
            attendance: document.querySelector('.attendance-modern')
        };
        
        const navLinks = document.querySelectorAll('.nav a');

        // Get last active section from localStorage or default to 'welcome'
        const lastActiveSection = localStorage.getItem('activeSection') || 'welcome';

        // Hide all sections first
        Object.values(sections).forEach(section => {
            if (section) section.style.display = 'none';
        });

        // Show the last active section
        if (sections[lastActiveSection]) {
            sections[lastActiveSection].style.display = 'block';
        }

        // Update active nav link
        navLinks.forEach(link => {
            const href = link.getAttribute('href').replace('#', '');
            if (href === lastActiveSection) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href').replace('#', '');
                
                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));
                // Add active class to clicked link
                link.classList.add('active');

                // Hide all sections first
                Object.values(sections).forEach(section => {
                    if (section) section.style.display = 'none';
                });

                // Show selected section
                switch(href) {
                    case 'welcome':
                    case 'tasks':
                    case 'attendance':
                        sections[href].style.display = 'block';
                        // Store active section in localStorage
                        localStorage.setItem('activeSection', href);
                        break;
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
            records: []
        };

        // Initialize buttons
        this.timeInBtn = document.getElementById('timeInBtn');
        this.breakBtn = document.getElementById('breakBtn');
        this.timeOutBtn = document.getElementById('timeOutBtn');
        this.tbody = document.getElementById('attendanceTableBody');
        this.clockDisplay = document.querySelector('.digital-time');
        this.dateDisplay = document.querySelector('.date-display');
        this.workedHoursDisplay = document.getElementById('todayHours');

        // Add event listeners
        if (this.timeInBtn) {
            this.timeInBtn.addEventListener('click', () => this.handleTimeIn());
        }
        if (this.breakBtn) {
            this.breakBtn.addEventListener('click', () => this.handleBreak());
        }
        if (this.timeOutBtn) {
            this.timeOutBtn.addEventListener('click', () => this.handleTimeOut());
        }

        // Start clock update
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);

        // Set initial button states
        if (this.breakBtn) this.breakBtn.disabled = true;
        if (this.timeOutBtn) this.timeOutBtn.disabled = true;
    }

    handleTimeIn() {
        if (this.state.isWorking) return;

        const now = new Date();
        this.state.isWorking = true;
        this.state.startTime = now;
        this.state.recordCount++; // Increment record counter

        // Create table row
        const row = document.createElement('tr');
        const rowId = `attendance-${Date.now()}`;
        row.id = rowId;
        this.state.currentRow = rowId;
        
        row.innerHTML = `
            <td>${this.state.recordCount}</td>
            <td>
                <div class="schedule-info">
                    <div>${this.formatDate(now)}</div>
                    <div class="time-range">1:00 PM - 10:00 PM</div>
                </div>
            </td>
            <td>${this.formatTime(now)}</td>
            <td>-</td>
            <td>-</td>
            <td>0:00</td>
            <td>Pending</td>
            <td>-</td>
            <td>0:00</td>
            <td>0:00</td>
            <td><span class="status-badge in-progress">Working</span></td>
            <td>
                <button class="action-btn">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </td>
        `;

        // Add row to table
        if (this.tbody) {
            // Remove scroll if more than 5 rows
            const rows = this.tbody.getElementsByTagName('tr');
            if (rows.length >= 5) {
                rows[0].remove(); // Remove the first row instead of the last
            }
            this.tbody.appendChild(row); // Append to end instead of inserting at beginning
        }

        // Enable/disable buttons
        if (this.timeInBtn) this.timeInBtn.disabled = true;
        if (this.breakBtn) this.breakBtn.disabled = false;
        if (this.timeOutBtn) this.timeOutBtn.disabled = false;
    }

    updateTableDisplay() {
        if (!this.tbody) return;

        // Calculate pagination
        const startIndex = (this.state.currentPage - 1) * this.state.recordsPerPage;
        const endIndex = startIndex + this.state.recordsPerPage;
        const recordsToShow = this.state.records.slice(startIndex, endIndex);

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
        const prevBtn = document.getElementById('prevRecords');
        const nextBtn = document.getElementById('nextRecords');
        
        if (prevBtn) {
            prevBtn.disabled = this.state.currentPage === 1;
        }
        
        if (nextBtn) {
            const maxPages = Math.ceil(this.state.records.length / this.state.recordsPerPage);
            nextBtn.disabled = this.state.currentPage >= maxPages;
        }
    }

    navigateRecords(direction) {
        if (direction === 'prev' && this.state.currentPage > 1) {
            this.state.currentPage--;
        } else if (direction === 'next') {
            const maxPages = Math.ceil(this.state.records.length / this.state.recordsPerPage);
            if (this.state.currentPage < maxPages) {
                this.state.currentPage++;
            }
        }
        
        this.updateTableDisplay();
    }

    formatDuration(ms) {
        const minutes = Math.floor(ms / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}:${remainingMinutes.toString().padStart(2, '0')}`;
    }

    handleBreak() {
        if (!this.state.isWorking) return;

        const now = new Date();
        if (!this.state.isOnBreak) {
            // Start Break
            this.state.isOnBreak = true;
            this.state.breakStartTime = now;
            if (this.breakBtn) {
                this.breakBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            }
            
            // Update row status to show "On Break"
            const row = document.getElementById(this.state.currentRow);
            if (row) {
                const cells = row.getElementsByTagName('td');
                cells[10].innerHTML = '<span class="status-badge break">On Break</span>';
            }
        } else {
            // End Break
            this.state.isOnBreak = false;
            this.state.breakDuration += now - this.state.breakStartTime;
            if (this.breakBtn) {
                this.breakBtn.innerHTML = '<i class="fas fa-coffee"></i> Break';
            }
            
            // Update row to show break duration and working status
            const row = document.getElementById(this.state.currentRow);
            if (row) {
                const cells = row.getElementsByTagName('td');
                cells[4].textContent = `${Math.floor(this.state.breakDuration / (1000 * 60))} min`; // Break duration
                cells[10].innerHTML = '<span class="status-badge in-progress">Working</span>';
            }
        }
    }

    handleTimeOut() {
        if (!this.state.isWorking) return;

        const now = new Date();
        const row = document.getElementById(this.state.currentRow);
        
        if (row) {
            const cells = row.getElementsByTagName('td');
            cells[3].textContent = this.formatTime(now); // Time Out
            cells[4].textContent = `${Math.floor(this.state.breakDuration / (1000 * 60))} min`; // Break duration
            cells[8].textContent = this.calculateWorkedHours(this.state.startTime, now); // Worked Hours
            cells[10].innerHTML = '<span class="status-badge completed">Completed</span>';
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
    }

    formatBreakDuration() {
        const minutes = Math.floor(this.state.breakDuration / (1000 * 60));
        return `${minutes} min`;
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

    loadInitialData() {
        const tbody = document.getElementById('attendanceTableBody');
        if (!tbody) return;

        // Sample data structure
        const sampleData = [
            {
                id: 1,
                schedule: {
                    date: 'February 27, 2025',
                    in: '1:00 PM',
                    out: '10:00 PM'
                },
                attendance: {
                    in: '12:57 PM',
                    out: '10:02 PM'
                },
                break: '1:0',
                tardiness: '0:00',
                undertime: '0:00',
                workedHours: '9:05',
                excessHours: '0:02',
                status: 'approved'
            }
            // Add more sample data as needed
        ];

        tbody.innerHTML = sampleData.map((record, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <div class="schedule-info">
                        <div>${record.schedule.date}</div>
                        <div class="time-range">${record.schedule.in} - ${record.schedule.out}</div>
                    </div>
                </td>
                <td>${record.attendance.in}</td>
                <td>${record.attendance.out}</td>
                <td>${record.break}</td>
                <td>${record.tardiness}</td>
                <td>${record.undertime}</td>
                <td>${record.break}</td>
                <td>${record.workedHours}</td>
                <td>${record.excessHours}</td>
                <td><span class="status-badge ${record.status}">${record.status}</span></td>
                <td>
                    <button class="action-btn">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    addAttendanceRecord(action, time) {
        const tbody = document.getElementById('attendanceTableBody');
        if (!tbody) {
            console.error('Table body not found!');
            return;
        }

        const formattedTime = this.formatTime(time);
        const formattedDate = this.formatDate(time);

        if (action === 'Time In') {
            const row = document.createElement('tr');
            const rowId = `attendance-row-${this.state.rowCounter++}`;
            row.id = rowId;
            this.state.currentRow = rowId;

            row.innerHTML = `
                <td>${this.state.rowCounter}</td>
                <td>${formattedDate}</td>
                <td>${formattedTime}</td>
                <td>-</td>
                <td>-</td>
                <td>0:00</td>
                <td><span class="status-badge in-progress">In Progress</span></td>
                <td>
                    <button class="action-btn">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </td>
            `;
            
            tbody.insertBefore(row, tbody.firstChild);
        } else if (action === 'Time Out' && this.state.currentRow) {
            const row = document.getElementById(this.state.currentRow);
            if (row) {
                const cells = row.getElementsByTagName('td');
                cells[3].textContent = formattedTime; // Time Out
                cells[5].textContent = this.calculateWorkedHours(this.state.startTime, time); // Hours
                cells[6].innerHTML = '<span class="status-badge completed">Completed</span>';
            }
            this.state.currentRow = null;
        }
    }

    loadAttendanceHistory() {
        // Implement loading attendance history from storage
    }

    updateStatusRing(hoursWorked) {
        const ring = document.querySelector('.ring-progress');
        if (!ring) return;

        const circumference = 2 * Math.PI * 45; // r=45 from SVG
        ring.style.strokeDasharray = circumference;
        
        // Calculate progress (assuming 8-hour workday)
        const progress = Math.min(hoursWorked / 8, 1);
        const offset = circumference - (progress * circumference);
        
        ring.style.strokeDashoffset = offset;
    }

    determineStatus(startTime, endTime, breakDuration) {
        // You can customize these conditions based on your requirements
        const scheduleStart = new Date(startTime);
        scheduleStart.setHours(9, 0, 0); // Set your schedule start time

        const scheduleEnd = new Date(startTime);
        scheduleEnd.setHours(18, 0, 0); // Set your schedule end time

        if (startTime > scheduleStart) {
            return 'Late';
        } else if (endTime < scheduleEnd) {
            return 'Early Out';
        } else {
            return 'Completed';
        }
    }

    initializeNavigation() {
        const prevBtn = document.getElementById('prevRecords');
        const nextBtn = document.getElementById('nextRecords');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateRecords('prev'));
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateRecords('next'));
        }
    }
}

// Initialize the app
const app = new TaskHouseApp();


