document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const taskSearch = document.getElementById('task-search');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const toggleAllBtn = document.getElementById('toggle-all');
    const themeToggle = document.getElementById('theme-toggle');
    const addTaskFab = document.getElementById('add-task-fab');
    const remainingCount = document.getElementById('remaining-count');
    const visibilityBtns = document.querySelectorAll('.visibility-btn');
    
    // Task array to store all tasks
    let tasks = [];
    let currentFilter = 'all';

    // Initialize the app
    init();

    // Event Listeners
    taskForm.addEventListener('submit', addTask);
    taskSearch.addEventListener('input', filterTasks);
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    toggleAllBtn.addEventListener('click', toggleAllTasks);
    themeToggle.addEventListener('click', toggleTheme);
    addTaskFab.addEventListener('click', focusTaskInput);
    
    visibilityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            visibilityBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    // Initialize the app
    function init() {
        loadTasks();
        renderTasks();
        updateRemainingCount();
    }

    // Add a new task
    function addTask(e) {
        e.preventDefault();
        
        const text = taskInput.value.trim();
        const dueDate = document.getElementById('task-due-date').value;
        const priority = document.getElementById('task-priority').value;
        
        if (text) {
            const task = {
                id: Date.now(),
                text,
                completed: false,
                dueDate,
                priority,
                createdAt: new Date()
            };
            
            tasks.push(task);
            saveTasks();
            renderTasks();
            updateRemainingCount();
            taskInput.value = '';
            document.getElementById('task-due-date').value = '';
        }
    }

    // Render tasks based on current filter
    function renderTasks() {
        taskList.innerHTML = '';
        
        let filteredTasks = tasks;
        
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        if (filteredTasks.length === 0) {
            const emptyState = document.createElement('li');
            emptyState.className = 'empty-state';
            emptyState.textContent = currentFilter === 'all' ? 'No tasks yet!' : 
                                   currentFilter === 'active' ? 'No active tasks!' : 'No completed tasks!';
            taskList.appendChild(emptyState);
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.priority} ${task.completed ? 'completed' : ''}`;
            taskItem.dataset.id = task.id;
            
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
                ${task.dueDate ? `<span class="task-due">${formatDate(task.dueDate)}</span>` : ''}
                <span class="task-priority-badge ${task.priority}">${task.priority}</span>
                <button class="edit-btn">✏️</button>
                <button class="delete-btn">🗑️</button>
            `;
            
            taskList.appendChild(taskItem);
            
            // Add event listeners to the new elements
            const checkbox = taskItem.querySelector('.task-checkbox');
            const editBtn = taskItem.querySelector('.edit-btn');
            const deleteBtn = taskItem.querySelector('.delete-btn');
            
            checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
            editBtn.addEventListener('click', () => editTask(task.id));
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
        });
    }

    // Toggle task completion status
    function toggleTaskComplete(id) {
        tasks = tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveTasks();
        renderTasks();
        updateRemainingCount();
    }

    // Edit task text
    function editTask(id) {
        const task = tasks.find(task => task.id === id);
        const taskItem = document.querySelector(`.task-item[data-id="${id}"]`);
        const taskText = taskItem.querySelector('.task-text');
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = task.text;
        input.className = 'edit-input';
        
        taskText.replaceWith(input);
        input.focus();
        
        function saveEdit() {
            const newText = input.value.trim();
            if (newText && newText !== task.text) {
                tasks = tasks.map(t => 
                    t.id === id ? { ...t, text: newText } : t
                );
                saveTasks();
            }
            renderTasks();
        }
        
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
        });
    }

    // Delete a task
    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        updateRemainingCount();
    }

    // Clear all completed tasks
    function clearCompletedTasks() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        updateRemainingCount();
    }

    // Toggle all tasks (complete/incomplete)
    function toggleAllTasks() {
        const allCompleted = tasks.every(task => task.completed);
        tasks = tasks.map(task => ({
            ...task,
            completed: !allCompleted
        }));
        saveTasks();
        renderTasks();
        updateRemainingCount();
    }

    // Filter tasks based on search input
    function filterTasks() {
        const searchTerm = taskSearch.value.toLowerCase();
        
        document.querySelectorAll('.task-item').forEach(item => {
            const text = item.querySelector('.task-text').textContent.toLowerCase();
            const matchesSearch = text.includes(searchTerm);
            item.style.display = matchesSearch ? '' : 'none';
        });
    }

    // Update the remaining tasks counter
    function updateRemainingCount() {
        const remaining = tasks.filter(task => !task.completed).length;
        remainingCount.textContent = remaining;
    }

    // Toggle between light/dark theme
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    // Focus on task input when FAB is clicked
    function focusTaskInput() {
        taskInput.focus();
    }

    // Format date for display
    function formatDate(dateString) {
        if (!dateString) return '';
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', options);
    }

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Load tasks from localStorage
    function loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }
        
        // Load saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    }
});