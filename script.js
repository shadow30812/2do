// Advanced To-Do App JavaScript
// Implements all core features and bonus challenges

class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.editingTaskId = null;
        this.init();
    }

    init() {
        this.loadTasks();
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
    }

    // Event binding
    bindEvents() {
        // Task input and add button
        const taskInput = document.getElementById('taskInput');
        const addTaskBtn = document.getElementById('addTaskBtn');

        addTaskBtn.addEventListener('click', () => this.addTask());
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Clear completed button
        const clearCompletedBtn = document.getElementById('clearCompletedBtn');
        clearCompletedBtn.addEventListener('click', () => this.clearCompleted());

        // Modal events
        this.bindModalEvents();
    }

    bindModalEvents() {
        const editModal = document.getElementById('editModal');
        const closeModal = document.getElementById('closeModal');
        const saveEditBtn = document.getElementById('saveEditBtn');
        const cancelEditBtn = document.getElementById('cancelEditBtn');
        const editTaskInput = document.getElementById('editTaskInput');

        closeModal.addEventListener('click', () => this.closeEditModal());
        cancelEditBtn.addEventListener('click', () => this.closeEditModal());
        saveEditBtn.addEventListener('click', () => this.saveEdit());

        editTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveEdit();
            }
        });

        // Close modal when clicking outside
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                this.closeEditModal();
            }
        });
    }

    // Task management methods
    addTask() {
        const taskInput = document.getElementById('taskInput');
        const taskText = taskInput.value.trim();

        if (!taskText) {
            this.showNotification('Please enter a task!', 'error');
            return;
        }

        if (taskText.length > 100) {
            this.showNotification('Task is too long! Maximum 100 characters.', 'error');
            return;
        }

        const newTask = {
            id: Date.now().toString(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        this.tasks.unshift(newTask);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();

        taskInput.value = '';
        this.showNotification('Task added successfully!', 'success');
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();

            const action = task.completed ? 'completed' : 'uncompleted';
            this.showNotification(`Task ${action}!`, 'success');
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showNotification('Task deleted!', 'success');
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.editingTaskId = taskId;
            const editInput = document.getElementById('editTaskInput');
            editInput.value = task.text;
            this.showEditModal();
        }
    }

    saveEdit() {
        const editInput = document.getElementById('editTaskInput');
        const newText = editInput.value.trim();

        if (!newText) {
            this.showNotification('Please enter a task!', 'error');
            return;
        }

        if (newText.length > 100) {
            this.showNotification('Task is too long! Maximum 100 characters.', 'error');
            return;
        }

        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            task.text = newText;
            this.saveTasks();
            this.renderTasks();
            this.closeEditModal();
            this.showNotification('Task updated successfully!', 'success');
        }
    }

    clearCompleted() {
        const completedTasks = this.tasks.filter(t => t.completed);

        if (completedTasks.length === 0) {
            this.showNotification('No completed tasks to clear!', 'info');
            return;
        }

        if (confirm(`Are you sure you want to delete ${completedTasks.length} completed task(s)?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showNotification(`${completedTasks.length} completed task(s) cleared!`, 'success');
        }
    }

    // Filter methods
    setFilter(filter) {
        this.currentFilter = filter;

        // Update active filter button
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.renderTasks();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    // Rendering methods
    renderTasks() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '';
            emptyState.style.display = 'block';
            this.updateEmptyStateMessage();
        } else {
            emptyState.style.display = 'none';
            taskList.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
            this.bindTaskEvents();
        }
    }

    createTaskHTML(task) {
        const createdDate = new Date(task.createdAt);
        const completedDate = task.completedAt ? new Date(task.completedAt) : null;

        const timeAgo = this.getTimeAgo(createdDate);
        const completedTime = completedDate ? `Completed ${this.getTimeAgo(completedDate)}` : '';

        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-content">
                    <div class="task-text">${this.escapeHtml(task.text)}</div>
                    <div class="task-meta">
                        <span><i class="fas fa-clock"></i> Created ${timeAgo}</span>
                        ${completedTime ? `<span><i class="fas fa-check-circle"></i> ${completedTime}</span>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-btn edit-btn" data-task-id="${task.id}" title="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-btn delete-btn" data-task-id="${task.id}" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    bindTaskEvents() {
        // Checkbox events
        const checkboxes = document.querySelectorAll('.task-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                const taskId = e.currentTarget.dataset.taskId;
                this.toggleTask(taskId);
            });
        });

        // Edit button events
        const editBtns = document.querySelectorAll('.edit-btn');
        editBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = e.currentTarget.dataset.taskId;
                this.editTask(taskId);
            });
        });

        // Delete button events
        const deleteBtns = document.querySelectorAll('.delete-btn');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = e.currentTarget.dataset.taskId;
                this.deleteTask(taskId);
            });
        });
    }

    updateEmptyStateMessage() {
        const emptyState = document.getElementById('emptyState');
        const icon = emptyState.querySelector('i');
        const title = emptyState.querySelector('h3');
        const message = emptyState.querySelector('p');

        switch (this.currentFilter) {
            case 'active':
                icon.className = 'fas fa-smile';
                title.textContent = 'No active tasks';
                message.textContent = 'Great job! You\'ve completed all your tasks.';
                break;
            case 'completed':
                icon.className = 'fas fa-history';
                title.textContent = 'No completed tasks';
                message.textContent = 'Complete some tasks to see them here.';
                break;
            default:
                icon.className = 'fas fa-clipboard-list';
                title.textContent = 'No tasks yet';
                message.textContent = 'Add your first task to get started!';
        }
    }

    // Statistics methods
    updateStats() {
        const totalTasks = this.tasks.length;
        const activeTasks = this.tasks.filter(t => !t.completed).length;
        const completedTasks = this.tasks.filter(t => t.completed).length;

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('activeTasks').textContent = activeTasks;
        document.getElementById('completedTasks').textContent = completedTasks;

        // Update clear completed button state
        const clearCompletedBtn = document.getElementById('clearCompletedBtn');
        clearCompletedBtn.disabled = completedTasks === 0;
    }

    // Modal methods
    showEditModal() {
        const modal = document.getElementById('editModal');
        modal.classList.add('show');
        document.getElementById('editTaskInput').focus();
        document.body.style.overflow = 'hidden';
    }

    closeEditModal() {
        const modal = document.getElementById('editModal');
        modal.classList.remove('show');
        this.editingTaskId = null;
        document.body.style.overflow = 'auto';
    }

    // Local storage methods
    saveTasks() {
        try {
            localStorage.setItem('todoApp_tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
            this.showNotification('Error saving tasks!', 'error');
        }
    }

    loadTasks() {
        try {
            const savedTasks = localStorage.getItem('todoApp_tasks');
            if (savedTasks) {
                this.tasks = JSON.parse(savedTasks);
                // Ensure all tasks have required properties
                this.tasks = this.tasks.map(task => ({
                    id: task.id || Date.now().toString(),
                    text: task.text || '',
                    completed: task.completed || false,
                    createdAt: task.createdAt || new Date().toISOString(),
                    completedAt: task.completedAt || null
                }));
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.tasks = [];
            this.showNotification('Error loading tasks!', 'error');
        }
    }

    // Utility methods
    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        // Add styles for notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;

        // Add keyframes for animation
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }

    getNotificationColor(type) {
        switch (type) {
            case 'success': return '#10b981';
            case 'error': return '#ef4444';
            case 'warning': return '#f59e0b';
            default: return '#6366f1';
        }
    }

    // Export/Import functionality (bonus feature)
    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const exportFileDefaultName = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        this.showNotification('Tasks exported successfully!', 'success');
    }

    importTasks(event) {
        const file = event.target.files[0];
        if (file && file.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedTasks = JSON.parse(e.target.result);
                    if (Array.isArray(importedTasks)) {
                        this.tasks = importedTasks;
                        this.saveTasks();
                        this.renderTasks();
                        this.updateStats();
                        this.showNotification('Tasks imported successfully!', 'success');
                    } else {
                        this.showNotification('Invalid file format!', 'error');
                    }
                } catch (error) {
                    this.showNotification('Error importing tasks!', 'error');
                }
            };
            reader.readAsText(file);
        }
    }

    // Keyboard shortcuts
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to add task
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                this.addTask();
            }

            // Escape to close modal
            if (e.key === 'Escape') {
                this.closeEditModal();
            }
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();

    // Add keyboard shortcuts
    window.todoApp.initKeyboardShortcuts();

    // Add export/import functionality to header (bonus feature)
    const header = document.querySelector('.header');
    const exportImportHTML = `
        <div class="export-import-container" style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
            <button id="exportBtn" class="export-btn" style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; gap: 0.25rem;">
                <i class="fas fa-download"></i> Export
            </button>
            <label for="importFile" class="import-btn" style="padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.875rem; display: flex; align-items: center; gap: 0.25rem;">
                <i class="fas fa-upload"></i> Import
            </label>
            <input type="file" id="importFile" accept=".json" style="display: none;">
        </div>
    `;
    header.insertAdjacentHTML('beforeend', exportImportHTML);

    // Bind export/import events
    document.getElementById('exportBtn').addEventListener('click', () => {
        window.todoApp.exportTasks();
    });

    document.getElementById('importFile').addEventListener('change', (e) => {
        window.todoApp.importTasks(e);
    });
});

// Service Worker registration for offline capability (bonus feature)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
