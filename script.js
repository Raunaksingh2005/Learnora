let currentTheme = localStorage.getItem('learnora-theme') || 'light';

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
    applyTheme(currentTheme);
    updateThemeToggle();
    initializeNavigation();
    initializeChatFeatures();
    initializeWellnessFeatures();
    initializeCommunityFeatures();
    initializeCourseFeatures();
    loadUserPreferences();
    loadTaskProgress();
    initializePeriodicNotifications();

    // Update initial notification badge
    updateNotificationBadge();
});

// Theme Functions
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    localStorage.setItem('learnora-theme', currentTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

function updateThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.checked = currentTheme === 'dark';
    }
}

// Settings Panel Functions
function toggleSettings() {
    const settingsPanel = document.getElementById('settings-panel');
    const notificationsDropdown = document.getElementById('notifications-dropdown');

    settingsPanel.classList.toggle('open');

    // Close notifications if open
    if (notificationsOpen) {
        toggleNotifications();
    }
}

// Mobile Navigation Functions
function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobile-nav');
    mobileNav.classList.toggle('open');
}
// Notification Management
let notificationsOpen = false;

function toggleNotifications() {
    const dropdown = document.getElementById('notifications-dropdown');
    notificationsOpen = !notificationsOpen;

    if (notificationsOpen) {
        dropdown.classList.add('show');
        // Close settings panel if open
        document.getElementById('settings-panel').classList.remove('open');

        // Add click outside listener
        document.addEventListener('click', handleOutsideNotificationClick);
    } else {
        dropdown.classList.remove('show');
        document.removeEventListener('click', handleOutsideNotificationClick);
    }
}

function handleOutsideNotificationClick(event) {
    const dropdown = document.getElementById('notifications-dropdown');
    const notificationBtn = document.querySelector('.notification-btn');

    if (!dropdown.contains(event.target) && !notificationBtn.contains(event.target)) {
        toggleNotifications();
    }
}

function markAllNotificationsRead() {
    const notificationItems = document.querySelectorAll('.notification-item.unread');
    const badge = document.querySelector('.notification-badge');

    notificationItems.forEach(item => {
        item.classList.remove('unread');
    });

    // Update badge
    badge.textContent = '0';
    badge.style.display = 'none';

    showNotification('All notifications marked as read', 'success');
}

function handleNotificationClick(notificationId) {
    // Mark this specific notification as read
    const notificationElement = event.currentTarget;
    notificationElement.classList.remove('unread');

    // Update badge count
    updateNotificationBadge();

    // Close notifications dropdown
    toggleNotifications();

    // Handle different notification types
    switch(notificationId) {
        case 'assignment-physics':
            showTaskDetail('task-assignment-physics');
            showNotification('Redirected to Physics Assignment details', 'info');
            break;
        case 'quiz-math':
            showTaskDetail('task-quiz-math');
            showNotification('Redirected to Math Quiz preparation', 'info');
            break;
        case 'course-update':
            // Navigate to courses section and highlight DSA course
            showSection('courses');
            highlightCourse('dsa');
            showNotification('Course update: New DSA materials available', 'info');
            break;
        case 'achievement':
            // Show achievement celebration
            showAchievementCelebration();
            break;
        case 'wellness-reminder':
            showSection('wellness');
            showNotification('Wellness check-in: How are you feeling today?', 'info');
            break;
        default:
            showNotification('Notification opened', 'info');
    }
}

function updateNotificationBadge() {
    const unreadCount = document.querySelectorAll('.notification-item.unread').length;
    const badge = document.querySelector('.notification-badge');

    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

function viewAllNotifications() {
    // This would typically open a full notifications page
    showNotification('Opening full notifications page...', 'info');
    toggleNotifications();
}

// Task Management Functions
function handleTaskClick(taskId) {
    const taskMap = {
        'assignment-physics': 'task-assignment-physics',
        'quiz-math': 'task-quiz-math',
        'chemistry-lab': 'task-chemistry-lab'
    };

    const sectionId = taskMap[taskId];
    if (sectionId) {
        showTaskDetail(sectionId);
        showNotification(`Opened ${taskId.replace('-', ' ')} details`, 'info');
    }
}

function showTaskDetail(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));

    // Show the specific task section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');

        // Update navigation
        updateNavigation(sectionId);

        // Scroll to top
        window.scrollTo(0, 0);
    }
}

function goBackToDashboard() {
    showSection('dashboard');
    showNotification('Returned to dashboard', 'info');
}

function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');

        // Update navigation
        updateNavigation(sectionId);

        // Scroll to top
        window.scrollTo(0, 0);
    }
}

function updateNavigation(sectionId) {
    // Update desktop navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });

    // Update mobile navigation
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
}

function updateTaskProgress(taskType) {
    const progressBars = {
        'physics': {
            progressBar: document.getElementById('physics-progress'),
            progressText: document.getElementById('physics-progress-text'),
            submitBtn: document.getElementById('physics-submit-btn')
        },
        'math': {
            progressBar: document.getElementById('math-progress'),
            progressText: document.getElementById('math-progress-text'),
            submitBtn: null // Math quiz doesn't have submit button
        }
    };

    if (!progressBars[taskType]) return;

    // Calculate progress based on checked items
    const sectionElement = document.getElementById(`task-${taskType === 'physics' ? 'assignment-physics' : 'quiz-math'}`);
    const checkboxes = sectionElement.querySelectorAll('.task-checklist input[type="checkbox"]');
    const checkedBoxes = sectionElement.querySelectorAll('.task-checklist input[type="checkbox"]:checked');

    const progress = Math.round((checkedBoxes.length / checkboxes.length) * 100);

    // Update progress bar and text
    const { progressBar, progressText, submitBtn } = progressBars[taskType];
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    if (progressText) {
        progressText.textContent = `${progress}% Complete`;
    }

    // Enable submit button if task is complete
    if (submitBtn && progress === 100) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        showNotification('Assignment ready for submission!', 'success');
    } else if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.6';
    }

    // Show progress feedback
    if (progress > 0) {
        showNotification(`Progress updated: ${progress}% complete`, 'success');
    }

    // Save progress to localStorage
    localStorage.setItem(`task-progress-${taskType}`, progress);
}

function startTask(taskId) {
    const taskMessages = {
        'assignment-physics': 'Starting Physics Assignment work session...',
        'chemistry-lab': 'Opening lab report template...'
    };

    const message = taskMessages[taskId] || 'Starting task...';
    showNotification(message, 'success');

    // Start study session timer
    startStudySession(taskId);

    // In a real app, this would open relevant tools or documents
    setTimeout(() => {
        showNotification('Work environment ready! Good luck with your task.', 'info');
    }, 2000);
}

function askForHelp(topic) {
    // Navigate to AI Tutor and ask relevant question
    showSection('ai-tutor');

    const helpQuestions = {
        'quantum-mechanics': 'I need help with quantum mechanics concepts for my physics assignment. Can you explain wave-particle duality?',
        'calculus-review': 'I have a calculus quiz coming up. Can you help me review integration techniques?',
        'lab-report-writing': 'How do I write a good chemistry lab report? What sections should I include?'
    };

    const question = helpQuestions[topic] || `I need help with ${topic}`;

    // Set the question in the chat input and send it
    setTimeout(() => {
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.value = question;
            sendMessage();
        }
    }, 500);

    showNotification('Asking AI Tutor for help...', 'info');
}

function setReminder(taskId) {
    const reminders = {
        'assignment-physics': 'Reminder set: Physics assignment due tomorrow at 11:59 PM',
        'quiz-math': 'Reminder set: Math quiz on Friday at 2:00 PM'
    };

    const message = reminders[taskId] || 'Reminder set successfully';
    showNotification(message, 'success');

    // In a real app, this would set up actual notifications
    // For demo, we'll simulate a reminder notification after a short delay
    setTimeout(() => {
        showNotification('⏰ Reminder: Don\'t forget about your upcoming task!', 'warning');
    }, 5000);
}

function submitAssignment(taskId) {
    if (taskId === 'assignment-physics') {
        const progressBar = document.getElementById('physics-progress');
        const currentWidth = parseInt(progressBar.style.width);

        if (currentWidth === 100) {
            showNotification('Assignment submitted successfully! ✅', 'success');

            // Mark task as completed
            const taskElement = document.querySelector('[onclick*="assignment-physics"]');
            if (taskElement) {
                taskElement.style.opacity = '0.6';
                const priority = taskElement.querySelector('.priority');
                if (priority) {
                    priority.textContent = 'Completed';
                    priority.className = 'priority low';
                }
            }

            // Disable submit button
            const submitBtn = document.getElementById('physics-submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = '✅ Submitted';
            submitBtn.style.background = 'var(--success-color)';

        } else {
            showNotification('Please complete all checklist items before submitting', 'warning');
        }
    }
}

function startPracticeQuiz() {
    showNotification('Loading practice quiz... This will help you prepare for the real exam!', 'info');

    // In a real app, this would open a practice quiz interface
    setTimeout(() => {
        showNotification('Practice quiz ready! You have 90 minutes to complete 20 questions.', 'success');
    }, 2000);
}

function highlightCourse(courseId) {
    // Find and highlight the specific course
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach(card => {
        const continueBtn = card.querySelector(`[onclick*="${courseId}"]`);
        if (continueBtn) {
            card.style.border = '2px solid var(--primary-color)';
            card.style.boxShadow = '0 0 20px rgba(79, 70, 229, 0.3)';

            // Reset highlight after 3 seconds
            setTimeout(() => {
                card.style.border = '1px solid var(--border-color)';
                card.style.boxShadow = '0 4px 20px var(--shadow-light)';
            }, 3000);
        }
    });
}

function showAchievementCelebration() {
    // Create a celebratory modal
    const modal = document.createElement('div');
    modal.className = 'achievement-modal';
    modal.innerHTML = `
        <div class="achievement-content">
            <div class="achievement-icon">🏆</div>
            <h2>Achievement Unlocked!</h2>
            <h3>15-Day Learning Streak</h3>
            <p>Congratulations! You've maintained a consistent learning habit for 15 days straight. Keep up the excellent work!</p>
            <button onclick="this.parentElement.parentElement.remove()" class="achievement-btn">
                Continue Learning
            </button>
        </div>
    `;

    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .achievement-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: fadeIn 0.3s ease;
        }

        .achievement-content {
            background: var(--bg-primary);
            padding: 3rem;
            border-radius: 1rem;
            text-align: center;
            max-width: 500px;
            margin: 2rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            animation: scaleIn 0.3s ease;
        }

        .achievement-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            animation: bounce 1s ease infinite;
        }

        .achievement-content h2 {
            color: var(--primary-color);
            margin-bottom: 0.5rem;
            font-size: 1.8rem;
        }

        .achievement-content h3 {
            color: var(--text-primary);
            margin-bottom: 1rem;
            font-size: 1.3rem;
        }

        .achievement-content p {
            color: var(--text-secondary);
            margin-bottom: 2rem;
            line-height: 1.6;
        }

        .achievement-btn {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 2rem;
            cursor: pointer;
            font-weight: 500;
            font-size: 1rem;
            transition: all 0.3s ease;
        }

        .achievement-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(79, 70, 229, 0.3);
        }

        @keyframes scaleIn {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }

        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(modal);

    // Play celebration sound (in a real app)
    showNotification('🎉 Achievement unlocked! 15-day streak completed!', 'success');
}

// Load task progress on page load
function loadTaskProgress() {
    const taskTypes = ['physics', 'math'];

    taskTypes.forEach(taskType => {
        const savedProgress = localStorage.getItem(`task-progress-${taskType}`);
        if (savedProgress) {
            const progress = parseInt(savedProgress);
            const progressBar = document.getElementById(`${taskType}-progress`);
            const progressText = document.getElementById(`${taskType}-progress-text`);

            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            if (progressText) {
                progressText.textContent = `${progress}% Complete`;
            }

            // Enable submit button if physics task is complete
            if (taskType === 'physics' && progress === 100) {
                const submitBtn = document.getElementById('physics-submit-btn');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                }
            }
        }
    });
}

// Add periodic notification system
function initializePeriodicNotifications() {
    // Simulate receiving new notifications
    setTimeout(() => {
        addNewNotification({
            id: 'study-reminder',
            type: 'wellness',
            title: 'Study Break Reminder',
            message: 'You\'ve been studying for 2 hours. Time for a 10-minute break!',
            time: 'Just now'
        });
    }, 30000); // 30 seconds after page load

    setTimeout(() => {
        addNewNotification({
            id: 'deadline-warning',
            type: 'assignment',
            title: 'Assignment Deadline Approaching',
            message: 'Physics assignment due in 6 hours. Make sure to submit on time!',
            time: 'Just now'
        });
    }, 60000); // 1 minute after page load
}

function addNewNotification(notification) {
    const notificationsList = document.getElementById('notifications-list');
    const notificationElement = document.createElement('div');
    notificationElement.className = 'notification-item unread';
    notificationElement.onclick = () => handleNotificationClick(notification.id);

    notificationElement.innerHTML = `
        <div class="notification-icon ${notification.type}">
            <i class="fas fa-${notification.type === 'wellness' ? 'heart' : 'file-alt'}"></i>
        </div>
        <div class="notification-content">
            <h5>${notification.title}</h5>
            <p>${notification.message}</p>
            <span class="notification-time">${notification.time}</span>
        </div>
        <div class="notification-status"></div>
    `;

    // Insert at the top of the list
    notificationsList.insertBefore(notificationElement, notificationsList.firstChild);

    // Update badge
    updateNotificationBadge();

    // Show toast notification
    showNotification(`📱 ${notification.title}`, 'info');
}


// Navigation Functions
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('href').substring(1);

            // Update active nav link
            document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // Also update corresponding desktop/mobile link
            const correspondingLinks = document.querySelectorAll(`[href="#${targetSection}"]`);
            correspondingLinks.forEach(l => l.classList.add('active'));

            // Show target section
            sections.forEach(section => section.classList.remove('active'));
            const targetElement = document.getElementById(targetSection);
            if (targetElement) {
                targetElement.classList.add('active');
            }
        });
    });
}

// Course Management Functions
function initializeCourseFeatures() {
    loadBookmarkedCourses();
    loadCourseProgress();
}

let courses = [
    {
        id: 'calculus',
        title: 'Advanced Calculus',
        instructor: 'Dr. Rajesh Kumar',
        progress: 75,
        status: 'in-progress',
        category: 'mathematics',
        difficulty: 'intermediate',
        rating: 4.8,
        lessons: { completed: 24, total: 32 },
        timeLeft: '12h',
        description: 'Master integration, differentiation, and advanced mathematical concepts',
        bookmarked: false
    },
    {
        id: 'quantum',
        title: 'Quantum Mechanics',
        instructor: 'Prof. Priya Sharma',
        progress: 45,
        status: 'in-progress',
        category: 'physics',
        difficulty: 'advanced',
        rating: 4.9,
        lessons: { completed: 18, total: 40 },
        timeLeft: '22h',
        description: 'Explore the fascinating world of quantum physics and particle behavior',
        bookmarked: true
    },
    {
        id: 'organic',
        title: 'Organic Chemistry Basics',
        instructor: 'Dr. Anjali Patel',
        progress: 100,
        status: 'completed',
        category: 'chemistry',
        difficulty: 'beginner',
        rating: 4.7,
        lessons: { completed: 20, total: 20 },
        timeLeft: null,
        description: 'Understanding carbon compounds and organic reaction mechanisms',
        bookmarked: false
    },
    {
        id: 'dsa',
        title: 'Data Structures & Algorithms',
        instructor: 'Prof. Arjun Singh',
        progress: 60,
        status: 'in-progress',
        category: 'computer-science',
        difficulty: 'intermediate',
        rating: 4.8,
        lessons: { completed: 30, total: 50 },
        timeLeft: '18h',
        description: 'Master essential programming concepts and problem-solving techniques',
        bookmarked: false
    },
    {
        id: 'biology',
        title: 'Molecular Biology',
        instructor: 'Dr. Kavitha Nair',
        progress: 0,
        status: 'not-started',
        category: 'biology',
        difficulty: 'beginner',
        rating: 4.6,
        lessons: { completed: 0, total: 25 },
        timeLeft: '15h',
        description: 'Explore DNA, RNA, and protein synthesis at the molecular level',
        bookmarked: false
    },
    {
        id: 'shakespeare',
        title: "Shakespeare's Masterworks",
        instructor: 'Prof. Sarah Johnson',
        progress: 30,
        status: 'in-progress',
        category: 'literature',
        difficulty: 'intermediate',
        rating: 4.5,
        lessons: { completed: 6, total: 20 },
        timeLeft: '10h',
        description: 'Analyze and appreciate the greatest works in English literature',
        bookmarked: false
    }
];

function filterCourses(status) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const courseCards = document.querySelectorAll('.course-card');

    // Update active filter button
    filterButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Filter course cards
    courseCards.forEach(card => {
        if (status === 'all' || card.dataset.status === status) {
            card.style.display = 'block';
            // Add fade-in animation
            card.style.opacity = '0';
            setTimeout(() => {
                card.style.opacity = '1';
            }, 100);
        } else {
            card.style.display = 'none';
        }
    });
}

function searchCourses() {
    const searchInput = document.getElementById('course-search');
    const searchTerm = searchInput.value.toLowerCase();
    const courseCards = document.querySelectorAll('.course-card');

    courseCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const instructor = card.querySelector('.course-instructor').textContent.toLowerCase();
        const description = card.querySelector('.course-description').textContent.toLowerCase();

        if (title.includes(searchTerm) || instructor.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function sortCourses() {
    const sortSelect = document.getElementById('course-sort');
    const sortValue = sortSelect.value;
    const coursesGrid = document.getElementById('courses-grid');
    const courseCards = Array.from(coursesGrid.querySelectorAll('.course-card'));

    courseCards.sort((a, b) => {
        switch (sortValue) {
            case 'name':
                const titleA = a.querySelector('h3').textContent;
                const titleB = b.querySelector('h3').textContent;
                return titleA.localeCompare(titleB);

            case 'progress':
                const progressA = parseInt(a.querySelector('.progress-info span:last-child').textContent);
                const progressB = parseInt(b.querySelector('.progress-info span:last-child').textContent);
                return progressB - progressA;

            case 'difficulty':
                const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
                const diffA = difficultyOrder[a.querySelector('.course-difficulty').textContent.toLowerCase()];
                const diffB = difficultyOrder[b.querySelector('.course-difficulty').textContent.toLowerCase()];
                return diffA - diffB;

            default: // recent
                return 0; // Keep current order for recent
        }
    });

    // Re-append sorted cards
    courseCards.forEach(card => coursesGrid.appendChild(card));
}

function continueCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (course) {
        showNotification(`Continuing ${course.title}. Loading lesson ${course.lessons.completed + 1}...`, 'success');
        // In a real app, this would navigate to the course content
    }
}

function startCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (course) {
        course.status = 'in-progress';
        course.progress = 5; // Start with 5% progress

        showNotification(`Started ${course.title}! Good luck with your learning journey.`, 'success');
        updateCourseCard(courseId);
        saveCourseProgress();
    }
}

function reviewCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (course) {
        showNotification(`Opening review mode for ${course.title}. You can revisit any lesson.`, 'info');
    }
}

function downloadCertificate(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (course && course.status === 'completed') {
        showNotification(`Certificate for ${course.title} is being prepared for download!`, 'success');
        // In a real app, this would generate and download the certificate
    }
}

function toggleBookmark(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (course) {
        course.bookmarked = !course.bookmarked;

        const bookmarkBtn = document.querySelector(`[onclick="toggleBookmark('${courseId}')"]`);
        if (bookmarkBtn) {
            if (course.bookmarked) {
                bookmarkBtn.classList.add('bookmarked');
                showNotification(`${course.title} added to bookmarks!`, 'success');
            } else {
                bookmarkBtn.classList.remove('bookmarked');
                showNotification(`${course.title} removed from bookmarks.`, 'info');
            }
        }

        saveBookmarkedCourses();
    }
}

function updateCourseCard(courseId) {
    const course = courses.find(c => c.id === courseId);
    const courseCard = document.querySelector(`[onclick*="${courseId}"]`).closest('.course-card');

    if (course && courseCard) {
        // Update progress
        const progressFill = courseCard.querySelector('.progress-fill');
        const progressText = courseCard.querySelector('.progress-info span:last-child');
        progressFill.style.width = `${course.progress}%`;
        progressText.textContent = `${course.progress}%`;

        // Update status
        const statusElement = courseCard.querySelector('.course-status');
        statusElement.textContent = course.status === 'in-progress' ? 'In Progress' : 'Not Started';
        statusElement.className = `course-status ${course.status}`;

        courseCard.dataset.status = course.status;
    }
}

function loadMoreCourses() {
    showNotification('Loading more courses...', 'info');

    // Simulate loading delay
    setTimeout(() => {
        showNotification('All available courses are already loaded!', 'info');
    }, 1000);
}

function saveCourseProgress() {
    localStorage.setItem('learnora-course-progress', JSON.stringify(courses));
}

function loadCourseProgress() {
    const savedProgress = localStorage.getItem('learnora-course-progress');
    if (savedProgress) {
        const savedCourses = JSON.parse(savedProgress);
        // Update existing courses with saved progress
        savedCourses.forEach(saved => {
            const course = courses.find(c => c.id === saved.id);
            if (course) {
                course.progress = saved.progress;
                course.status = saved.status;
                course.bookmarked = saved.bookmarked;
            }
        });
    }
}

function saveBookmarkedCourses() {
    const bookmarked = courses.filter(c => c.bookmarked).map(c => c.id);
    localStorage.setItem('learnora-bookmarked-courses', JSON.stringify(bookmarked));
}

function loadBookmarkedCourses() {
    const saved = localStorage.getItem('learnora-bookmarked-courses');
    if (saved) {
        const bookmarkedIds = JSON.parse(saved);
        bookmarkedIds.forEach(id => {
            const course = courses.find(c => c.id === id);
            if (course) {
                course.bookmarked = true;
            }
        });
    }
}

// Chat Features
function initializeChatFeatures() {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', handleKeyPress);
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    if (!chatInput || !chatMessages || !chatInput.value.trim()) return;

    const userMessage = chatInput.value.trim();

    // Add user message
    addMessage(userMessage, 'user');

    // Clear input
    chatInput.value = '';

    // Simulate AI response
    setTimeout(() => {
        const aiResponse = generateAIResponse(userMessage);
        addMessage(aiResponse, 'ai');
    }, 1000);
}

function askQuestion(question) {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.value = question;
        sendMessage();
    }
}

function addMessage(text, sender) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = sender === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `<p>${text}</p>`;

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateAIResponse(userMessage) {
    const responses = {
        'quadratic equations': 'Quadratic equations are polynomial equations of degree 2, in the form ax² + bx + c = 0. The solutions can be found using the quadratic formula: x = (-b ± √(b² - 4ac)) / (2a). Would you like me to walk through an example?',
        'essay writing': 'For effective essay writing, start with a strong thesis statement, create an outline, use topic sentences for each paragraph, provide evidence to support your points, and conclude by restating your thesis with new insights. What specific aspect of essay writing would you like help with?',
        'study schedule': 'Create an effective study schedule by: 1) Identifying your peak focus hours, 2) Breaking large tasks into smaller chunks, 3) Using the Pomodoro technique (25 min study, 5 min break), 4) Scheduling regular review sessions, and 5) Including breaks for meals and rest. What subjects are you planning to include?',
        'calculus': 'I see you\'re working on Advanced Calculus! You\'re at 75% completion - excellent progress. The next topic is advanced integration techniques. Would you like me to help you prepare for upcoming lessons?',
        'quantum': 'Quantum Mechanics can be challenging! You\'re currently at 45% completion. Key concepts to focus on: wave-particle duality, Heisenberg uncertainty principle, and Schrödinger equation. What specific quantum concept would you like to explore?',
        'chemistry': 'Great job completing Organic Chemistry Basics! You earned your certificate with a 4.7/5 rating. Ready to start Advanced Organic Chemistry or explore Physical Chemistry next?',
        'programming': 'Data Structures & Algorithms is crucial for programming success! You\'re 60% through the course. Up next: tree traversals and graph algorithms. Need help with any specific data structure?',
        'quantum-mechanics': 'Quantum mechanics deals with the behavior of matter and energy at the atomic scale. Key concepts include: **Wave-particle duality** - particles can exhibit both wave and particle properties. For your assignment, focus on how electrons can be described as both particles (localized) and waves (probability distributions). The de Broglie wavelength λ = h/p relates particle momentum to wavelength. Would you like me to explain specific problems from your assignment?',
        'help with quantum mechanics': 'I\'d be happy to help with quantum mechanics! For your physics assignment, let\'s break down the key concepts: 1) **Wave-particle duality**: Light and matter exhibit both wave and particle properties. 2) **Heisenberg Uncertainty Principle**: Δx × Δp ≥ ℏ/2 - you cannot precisely know both position and momentum simultaneously. 3) **Schrödinger Equation**: Describes how quantum systems evolve over time. Which specific problems are you working on?',
        'default': 'That\'s an interesting question! I can help you with various topics including mathematics, science, study techniques, essay writing, and exam preparation. I can also provide personalized guidance based on your current courses. What would you like to learn about?'
    };

    const lowerMessage = userMessage.toLowerCase();
    for (let key in responses) {
        if (lowerMessage.includes(key)) {
            return responses[key];
        }
    }
    return responses['default'];
}

// Wellness Features
function initializeWellnessFeatures() {
    initializeMoodTracker();
    initializeBreathingExercise();
}

function initializeMoodTracker() {
    const moodButtons = document.querySelectorAll('.mood-btn');
    moodButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            moodButtons.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');

            const mood = this.getAttribute('data-mood');
            saveMoodEntry(mood);
            showMoodFeedback(mood);
        });
    });
}

function saveMoodEntry(mood) {
    const today = new Date().toISOString().split('T')[0];
    const moodData = JSON.parse(localStorage.getItem('learnora-moods') || '{}');
    moodData[today] = mood;
    localStorage.setItem('learnora-moods', JSON.stringify(moodData));
}

function showMoodFeedback(mood) {
    const feedback = {
        'happy': 'Great to see you\'re feeling positive! Keep up the good energy in your studies.',
        'neutral': 'A balanced mood is good. Consider taking a short break or doing something you enjoy.',
        'stressed': 'Feeling stressed? Try our breathing exercise or take a short meditation break.',
        'sad': 'I understand you\'re feeling down. Remember, it\'s okay to feel this way. Consider talking to someone or taking a wellness break.'
    };

    setTimeout(() => {
        showNotification(feedback[mood] || 'Thank you for sharing your mood with us.', 'info');
    }, 500);
}

let breathingInterval;
let breathingPhase = 'inhale';
let breathingCount = 0;

function startBreathing() {
    const circle = document.querySelector('.breathing-circle');
    const circleInner = document.querySelector('.circle-inner');

    if (!circle || !circleInner) return;

    if (breathingInterval) {
        clearInterval(breathingInterval);
        breathingInterval = null;
        circle.classList.remove('breathing');
        circleInner.textContent = 'Breathe';
        return;
    }

    breathingCount = 0;
    circle.classList.add('breathing');

    breathingInterval = setInterval(() => {
        switch (breathingPhase) {
            case 'inhale':
                circleInner.textContent = 'Inhale';
                setTimeout(() => {
                    breathingPhase = 'hold1';
                }, 4000);
                break;
            case 'hold1':
                circleInner.textContent = 'Hold';
                setTimeout(() => {
                    breathingPhase = 'exhale';
                }, 7000);
                break;
            case 'exhale':
                circleInner.textContent = 'Exhale';
                setTimeout(() => {
                    breathingPhase = 'hold2';
                }, 8000);
                break;
            case 'hold2':
                circleInner.textContent = 'Hold';
                breathingCount++;
                if (breathingCount >= 4) {
                    clearInterval(breathingInterval);
                    breathingInterval = null;
                    circle.classList.remove('breathing');
                    circleInner.textContent = 'Complete!';
                    setTimeout(() => {
                        circleInner.textContent = 'Breathe';
                    }, 2000);
                } else {
                    setTimeout(() => {
                        breathingPhase = 'inhale';
                    }, 1000);
                }
                break;
        }
    }, 100);
}

// Community Features
function initializeCommunityFeatures() {
    initializeTabs();
}

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.textContent.toLowerCase().replace(/\s+/g, '-');

            tabButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });
        });
    });
}

function switchTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().replace(/\s+/g, '-') === tabName) {
            btn.classList.add('active');
        }
    });

    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tabName) {
            content.classList.add('active');
        }
    });
}

// Floating AI Assistant
function toggleAIAssistant() {
    // Switch to AI Tutor section
    const aiTutorLink = document.querySelector('a[href="#ai-tutor"]');
    if (aiTutorLink) {
        aiTutorLink.click();
    }
}

// User Preferences Management
function loadUserPreferences() {
    // Load notification settings
    const notificationsToggle = document.getElementById('notifications-toggle');
    if (notificationsToggle) {
        const notificationsEnabled = localStorage.getItem('learnora-notifications') !== 'false';
        notificationsToggle.checked = notificationsEnabled;

        notificationsToggle.addEventListener('change', function() {
            localStorage.setItem('learnora-notifications', this.checked);
        });
    }

    // Load AI assistance settings
    const aiToggle = document.getElementById('ai-toggle');
    if (aiToggle) {
        const aiEnabled = localStorage.getItem('learnora-ai-assistance') !== 'false';
        aiToggle.checked = aiEnabled;

        aiToggle.addEventListener('change', function() {
            localStorage.setItem('learnora-ai-assistance', this.checked);
        });
    }
}

// Task Management
function toggleTask(taskId) {
    const task = document.getElementById(taskId);
    if (task) {
        const isChecked = task.checked;
        // Save task completion status
        localStorage.setItem(`task-${taskId}`, isChecked);

        // Visual feedback
        const taskItem = task.closest('.task-item');
        if (taskItem) {
            if (isChecked) {
                taskItem.style.opacity = '0.6';
                taskItem.style.textDecoration = 'line-through';
            } else {
                taskItem.style.opacity = '1';
                taskItem.style.textDecoration = 'none';
            }
        }
    }
}

// Progress Animation
function animateProgress() {
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = width;
        }, 100);
    });
}

// Notification System
function showNotification(message, type = 'info') {
    // Check if notifications are enabled
    const notificationsEnabled = localStorage.getItem('learnora-notifications') !== 'false';
    if (!notificationsEnabled) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button onclick="this.parentElement.remove()" class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add notification styles if not exists
    if (!document.querySelector('.notification-styles')) {
        const style = document.createElement('style');
        style.className = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                padding: 1rem;
                box-shadow: 0 4px 20px var(--shadow-medium);
                z-index: 1001;
                display: flex;
                align-items: center;
                gap: 1rem;
                max-width: 400px;
                animation: slideInRight 0.3s ease;
            }

            .notification.success { border-left: 4px solid var(--success-color); }
            .notification.warning { border-left: 4px solid var(--warning-color); }
            .notification.error { border-left: 4px solid var(--error-color); }
            .notification.info { border-left: 4px solid var(--primary-color); }

            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                flex: 1;
                color: var(--text-primary);
            }

            .notification-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                padding: 0.2rem;
            }

            @keyframes slideInRight {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }

            @media (max-width: 768px) {
                .notification {
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Study Session Timer
let studyTimer;
let studyTimeElapsed = 0;
let isStudySessionActive = false;

function startStudySession(subject = 'General Study') {
    if (isStudySessionActive) {
        endStudySession();
        return;
    }

    isStudySessionActive = true;
    studyTimeElapsed = 0;

    studyTimer = setInterval(() => {
        studyTimeElapsed++;
        updateStudyTimer();
    }, 1000);

    showNotification(`Study session started for ${subject}!`, 'success');
}

function endStudySession() {
    if (studyTimer) {
        clearInterval(studyTimer);
        studyTimer = null;
    }

    isStudySessionActive = false;

    const minutes = Math.floor(studyTimeElapsed / 60);
    const seconds = studyTimeElapsed % 60;

    showNotification(`Study session completed! You studied for ${minutes}m ${seconds}s`, 'success');

    // Save study session to localStorage
    const sessions = JSON.parse(localStorage.getItem('learnora-study-sessions') || '[]');
    sessions.push({
        date: new Date().toISOString(),
        duration: studyTimeElapsed
    });
    localStorage.setItem('learnora-study-sessions', JSON.stringify(sessions));
}

function updateStudyTimer() {
    const minutes = Math.floor(studyTimeElapsed / 60);
    const seconds = studyTimeElapsed % 60;
    const timerDisplay = document.querySelector('.timer-display');

    if (timerDisplay) {
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Gamification Features
function updateUserStats() {
    const stats = JSON.parse(localStorage.getItem('learnora-user-stats') || '{}');

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = stats.lastActivity;

    if (lastActivity !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];

        if (lastActivity === yesterdayString) {
            stats.streak = (stats.streak || 0) + 1;
        } else {
            stats.streak = 1;
        }

        stats.lastActivity = today;
        localStorage.setItem('learnora-user-stats', JSON.stringify(stats));
    }
}

// Initialize stats update
updateUserStats();

// AR/VR Launch Functions
function launchVRLab() {
    showNotification('Launching Virtual Chemistry Lab... Please put on your VR headset.', 'info');
    // In a real implementation, this would interface with VR APIs
}

function startARMode() {
    showNotification('Starting AR Geometry Explorer... Point your camera at a flat surface.', 'info');
    // In a real implementation, this would start AR camera
}

function beginHistoricalJourney() {
    showNotification('Beginning Historical Time Travel... Loading ancient Egypt experience.', 'info');
    // In a real implementation, this would load VR historical experience
}

// Touch and Mobile Support
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchmove', function(e) {
    if (!touchStartX || !touchStartY) return;

    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;

    const deltaX = touchStartX - touchEndX;
    const deltaY = touchStartY - touchEndY;

    // Horizontal swipe detection for course cards
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        const target = e.target.closest('.course-card');
        if (target) {
            if (deltaX > 0) {
                // Swipe left - show options
                target.classList.add('swiped-left');
            } else {
                // Swipe right - hide options
                target.classList.remove('swiped-left');
            }
        }
    }

    touchStartX = 0;
    touchStartY = 0;
});

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export functions for global use
window.toggleTheme = toggleTheme;
window.toggleSettings = toggleSettings;
window.toggleMobileMenu = toggleMobileMenu;
window.toggleNotifications = toggleNotifications;
window.markAllNotificationsRead = markAllNotificationsRead;
window.handleNotificationClick = handleNotificationClick;
window.viewAllNotifications = viewAllNotifications;
window.handleTaskClick = handleTaskClick;
window.goBackToDashboard = goBackToDashboard;
window.updateTaskProgress = updateTaskProgress;
window.startTask = startTask;
window.askForHelp = askForHelp;
window.setReminder = setReminder;
window.submitAssignment = submitAssignment;
window.startPracticeQuiz = startPracticeQuiz;
window.sendMessage = sendMessage;
window.askQuestion = askQuestion;
window.handleKeyPress = handleKeyPress;
window.startBreathing = startBreathing;
window.switchTab = switchTab;
window.toggleAIAssistant = toggleAIAssistant;
window.launchVRLab = launchVRLab;
window.startARMode = startARMode;
window.beginHistoricalJourney = beginHistoricalJourney;

// Course functions
window.filterCourses = filterCourses;
window.searchCourses = searchCourses;
window.sortCourses = sortCourses;
window.continueCourse = continueCourse;
window.startCourse = startCourse;
window.reviewCourse = reviewCourse;
window.downloadCertificate = downloadCertificate;
window.toggleBookmark = toggleBookmark;
window.loadMoreCourses = loadMoreCourses;