// API Base URL - update this when deploying
const API_URL = window.location.origin;
const PASSWORD = 'shardul123';

// Authentication check
const isAuthenticated = () => sessionStorage.getItem('authenticated') === 'true';

const checkAuth = () => {
    if (!isAuthenticated()) {
        document.getElementById('authPage').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
        return false;
    }
    document.getElementById('authPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    return true;
};

// State management
let deadlines = [];
let editingDeadlineId = null;
let isPlanLocked = false;

// DOM Elements
const addDeadlineBtn = document.getElementById('addDeadlineBtn');
const deadlineModal = document.getElementById('deadlineModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const deadlineForm = document.getElementById('deadlineForm');
const deadlinesList = document.getElementById('deadlinesList');
const modalTitle = document.getElementById('modalTitle');

const tomorrowPlanTextarea = document.getElementById('tomorrowPlan');
const saveTomorrowBtn = document.getElementById('saveTomorrowBtn');
const editPlanBtn = document.getElementById('editPlanBtn');
const clearPlanBtn = document.getElementById('clearPlanBtn');

// Authentication Form
document.getElementById('authForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('passwordInput').value;
    const errorMsg = document.getElementById('authError');

    if (password === PASSWORD) {
        sessionStorage.setItem('authenticated', 'true');
        checkAuth();
        loadDeadlines();
    } else {
        errorMsg.textContent = 'Incorrect password';
        document.getElementById('passwordInput').value = '';
    }
});

// Tab switching
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;

        // Update active tab button
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update active tab content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabName}-tab`) {
                content.classList.add('active');
            }
        });

        // Load day plan if switching to that tab
        if (tabName === 'tomorrow') {
            loadDayPlan();
        }
    });
});

// Modal functions
function openModal(deadline = null) {
    editingDeadlineId = deadline ? deadline._id : null;

    if (deadline) {
        modalTitle.textContent = 'Edit Deadline';
        document.getElementById('title').value = deadline.title;
        document.getElementById('description').value = deadline.description || '';

        // Format date for input
        const dueDate = new Date(deadline.dueDate);
        document.getElementById('dueDate').value = dueDate.toISOString().split('T')[0];
        document.getElementById('dueTime').value = deadline.dueTime || '';
    } else {
        modalTitle.textContent = 'Add Deadline';
        deadlineForm.reset();
    }

    deadlineModal.classList.add('active');
}

function closeModal() {
    deadlineModal.classList.remove('active');
    deadlineForm.reset();
    editingDeadlineId = null;
}

// Event Listeners
addDeadlineBtn.addEventListener('click', () => openModal());
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

// Close modal when clicking outside
deadlineModal.addEventListener('click', (e) => {
    if (e.target === deadlineModal) {
        closeModal();
    }
});

// Form submission
deadlineForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        dueDate: document.getElementById('dueDate').value,
        dueTime: document.getElementById('dueTime').value
    };

    try {
        if (editingDeadlineId) {
            await updateDeadline(editingDeadlineId, formData);
        } else {
            await createDeadline(formData);
        }
        closeModal();
        await loadDeadlines();
    } catch (error) {
        console.error('Error saving deadline:', error);
        alert('Failed to save deadline. Please try again.');
    }
});

// API Functions

// Load all deadlines
async function loadDeadlines() {
    try {
        deadlinesList.innerHTML = '<div class="loading">Loading deadlines...</div>';

        const response = await fetch(`${API_URL}/api/deadlines`);
        if (!response.ok) throw new Error('Failed to fetch deadlines');

        deadlines = await response.json();
        renderDeadlines();
    } catch (error) {
        console.error('Error loading deadlines:', error);
        deadlinesList.innerHTML = '<div class="empty-state">Failed to load deadlines. Please refresh the page.</div>';
    }
}

// Create deadline
async function createDeadline(data) {
    const response = await fetch(`${API_URL}/api/deadlines`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Failed to create deadline');
    return await response.json();
}

// Update deadline
async function updateDeadline(id, data) {
    const response = await fetch(`${API_URL}/api/deadlines/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Failed to update deadline');
    return await response.json();
}

// Delete deadline
async function deleteDeadline(id) {
    if (!confirm('Are you sure you want to delete this deadline?')) return;

    try {
        const response = await fetch(`${API_URL}/api/deadlines/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete deadline');

        await loadDeadlines();
    } catch (error) {
        console.error('Error deleting deadline:', error);
        alert('Failed to delete deadline. Please try again.');
    }
}

// Render deadlines
function renderDeadlines() {
    if (deadlines.length === 0) {
        deadlinesList.innerHTML = `
            <div class="empty-state">
                <p>No deadlines yet. Click "+ Add Deadline" to get started!</p>
            </div>
        `;
        return;
    }

    deadlinesList.innerHTML = deadlines.map(deadline => {
        const { statusClass, statusText } = getDeadlineStatus(deadline.dueDate);
        const sliderPosition = calculateSliderPosition(deadline.dueDate, deadline.createdAt);

        const dueDate = new Date(deadline.dueDate);
        const dateStr = dueDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const timeStr = deadline.dueTime ?
            ` at ${formatTime(deadline.dueTime)}` : '';

        return `
            <div class="deadline-card ${statusClass}" style="--slider-position: ${sliderPosition}%;">
                <div class="time-slider"></div>
                <div class="deadline-header">
                    <h3 class="deadline-title">${escapeHtml(deadline.title)}</h3>
                    <div class="deadline-actions">
                        <button class="icon-btn edit-btn" onclick="editDeadline('${deadline._id}')" title="Edit">
                            Edit
                        </button>
                        <button class="icon-btn delete-btn" onclick="deleteDeadline('${deadline._id}')" title="Delete">
                            Delete
                        </button>
                    </div>
                </div>
                ${deadline.description ? `<p class="deadline-description">${escapeHtml(deadline.description)}</p>` : ''}
                <div class="deadline-footer">
                    <div class="deadline-date">
                        ${dateStr}${timeStr}
                    </div>
                    <span class="date-badge badge-${statusClass}">${statusText}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Get deadline status (overdue, today, upcoming)
function getDeadlineStatus(dueDate) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { statusClass: 'overdue', statusText: 'Overdue' };
    } else if (diffDays === 0) {
        return { statusClass: 'today', statusText: 'Today' };
    } else if (diffDays === 1) {
        return { statusClass: 'upcoming', statusText: 'Tomorrow' };
    } else if (diffDays <= 7) {
        return { statusClass: 'upcoming', statusText: `${diffDays} days` };
    } else {
        return { statusClass: 'upcoming', statusText: 'Upcoming' };
    }
}

// Calculate time slider position (0-100%)
function calculateSliderPosition(dueDate, createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    const due = new Date(dueDate);

    // If overdue, return 100%
    if (now > due) {
        return 100;
    }

    // Calculate total time span and elapsed time
    const totalTime = due - created;
    const elapsedTime = now - created;

    // Calculate percentage (0-100)
    const percentage = Math.min(Math.max((elapsedTime / totalTime) * 100, 0), 100);

    return Math.round(percentage);
}

// Edit deadline
window.editDeadline = async function(id) {
    const deadline = deadlines.find(d => d._id === id);
    if (deadline) {
        openModal(deadline);
    }
};

// Delete deadline (exposed globally)
window.deleteDeadline = deleteDeadline;

// Day Plan Functions
let selectedDeadlineIds = [];

async function loadDayPlan() {
    try {
        const response = await fetch(`${API_URL}/api/planner/tomorrow`);
        if (!response.ok) throw new Error('Failed to fetch plan');

        const plan = await response.json();
        tomorrowPlanTextarea.value = plan.content || '';
        selectedDeadlineIds = plan.selectedDeadlines || [];

        renderAvailableDeadlines();
        renderSelectedDeadlines();
    } catch (error) {
        console.error('Error loading day plan:', error);
    }
}

function renderAvailableDeadlines() {
    const availableDeadlinesList = document.getElementById('availableDeadlinesList');

    if (deadlines.length === 0) {
        availableDeadlinesList.innerHTML = '<div class="empty-selection">No deadlines available</div>';
        return;
    }

    availableDeadlinesList.innerHTML = deadlines.map(deadline => {
        const { statusClass } = getDeadlineStatus(deadline.dueDate);
        const isSelected = selectedDeadlineIds.includes(deadline._id);

        const dueDate = new Date(deadline.dueDate);
        const dateStr = dueDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });

        return `
            <div class="selectable-deadline ${statusClass} ${isSelected ? 'selected' : ''}"
                 data-deadline-id="${deadline._id}"
                 onclick="toggleDeadlineSelection('${deadline._id}')">
                <div class="selectable-deadline-title">${escapeHtml(deadline.title)}</div>
                <div class="selectable-deadline-date">${dateStr}</div>
            </div>
        `;
    }).join('');
}

function renderSelectedDeadlines() {
    const selectedDeadlinesList = document.getElementById('selectedDeadlinesList');

    if (selectedDeadlineIds.length === 0) {
        selectedDeadlinesList.innerHTML = '';
        return;
    }

    const selectedDeadlines = deadlines.filter(d => selectedDeadlineIds.includes(d._id));

    selectedDeadlinesList.innerHTML = selectedDeadlines.map(deadline => {
        const { statusClass } = getDeadlineStatus(deadline.dueDate);

        return `
            <div class="selected-deadline-item ${statusClass}">
                <span class="selected-deadline-title">${escapeHtml(deadline.title)}</span>
                <button class="remove-deadline-btn" onclick="removeDeadlineFromPlan('${deadline._id}')" title="Remove">
                    ✕
                </button>
            </div>
        `;
    }).join('');
}

window.toggleDeadlineSelection = function(deadlineId) {
    const index = selectedDeadlineIds.indexOf(deadlineId);

    if (index === -1) {
        // Add to selection
        selectedDeadlineIds.push(deadlineId);
    } else {
        // Remove from selection
        selectedDeadlineIds.splice(index, 1);
    }

    renderAvailableDeadlines();
    renderSelectedDeadlines();
};

window.removeDeadlineFromPlan = function(deadlineId) {
    const index = selectedDeadlineIds.indexOf(deadlineId);
    if (index !== -1) {
        selectedDeadlineIds.splice(index, 1);
        renderAvailableDeadlines();
        renderSelectedDeadlines();
    }
};

// Save Plan - Freezes editing
saveTomorrowBtn.addEventListener('click', async () => {
    // Lock the plan (don't save to database)
    isPlanLocked = true;
    tomorrowPlanTextarea.disabled = true;

    // Disable deadline selection
    const selectableDeadlines = document.querySelectorAll('.selectable-deadline');
    selectableDeadlines.forEach(el => {
        el.style.pointerEvents = 'none';
        el.style.opacity = '0.6';
    });

    // Disable remove buttons
    const removeButtons = document.querySelectorAll('.remove-deadline-btn');
    removeButtons.forEach(btn => btn.disabled = true);

    // Toggle buttons
    saveTomorrowBtn.style.display = 'none';
    editPlanBtn.style.display = 'inline-block';

    // Show feedback
    const originalText = saveTomorrowBtn.textContent;
    saveTomorrowBtn.textContent = '✓ Saved!';
});

// Edit Plan - Resumes editing
editPlanBtn.addEventListener('click', () => {
    isPlanLocked = false;
    tomorrowPlanTextarea.disabled = false;

    // Enable deadline selection
    const selectableDeadlines = document.querySelectorAll('.selectable-deadline');
    selectableDeadlines.forEach(el => {
        el.style.pointerEvents = 'auto';
        el.style.opacity = '1';
    });

    // Enable remove buttons
    const removeButtons = document.querySelectorAll('.remove-deadline-btn');
    removeButtons.forEach(btn => btn.disabled = false);

    // Toggle buttons
    editPlanBtn.style.display = 'none';
    saveTomorrowBtn.style.display = 'inline-block';
});

// Clear Plan - With confirmation
clearPlanBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the plan? This will remove all selected deadlines and notes.')) {
        // Clear everything
        selectedDeadlineIds = [];
        tomorrowPlanTextarea.value = '';
        isPlanLocked = false;
        tomorrowPlanTextarea.disabled = false;

        // Reset buttons
        editPlanBtn.style.display = 'none';
        saveTomorrowBtn.style.display = 'inline-block';

        // Re-render
        renderAvailableDeadlines();
        renderSelectedDeadlines();
    }
});

// Utility Functions
function formatTime(time24) {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    if (checkAuth()) {
        loadDeadlines();

        // Set minimum date to today for date input
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('dueDate').setAttribute('min', today);
    }
});
