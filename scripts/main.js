document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeToggleIcon = themeToggle.querySelector('img');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const extensionsContainer = document.getElementById('extensions-container');
    const searchBar = document.querySelector('.search-bar');
    const removeModal = document.getElementById('remove-modal');
    const modalCancel = document.getElementById('modal-cancel');
    const modalConfirm = document.getElementById('modal-confirm');
    let extensionsData = [];
    let currentFilter = 'all';
    let searchQuery = '';
    let pendingRemoveIdx = null;

    // Map extension names to CSS variable backgrounds
    const cardBgMap = {
        'devlens': 'var(--devlens-bg)',
        'stylespy': 'var(--stylespy-bg)',
        'speedboost': 'var(--speedboost-bg)',
        'jsonwizard': 'var(--jsonwizard-bg)',
        'tabmaster pro': 'var(--tabmasterpro-bg)',
        'viewportbuddy': 'var(--viewportbuddy-bg)',
        'markup notes': 'var(--markupnotes-bg)',
        'gridguides': 'var(--gridguides-bg)',
        'palette picker': 'var(--palettepicker-bg)',
        'linkchecker': 'var(--linkchecker-bg)',
        'dom snapshot': 'var(--domsnapshot-bg)',
        'consoleplus': 'var(--consoleplus-bg)'
    };

    // Load extensions from data.json
    fetch('data.json')
        .then(response => response.json())
        .then(extensions => {
            extensionsData = extensions;
            renderExtensions();
        })
        .catch(error => console.error('Error loading extensions:', error));

    // Theme toggle
    function updateThemeIcon() {
        if (document.body.classList.contains('dark-theme')) {
            themeToggleIcon.src = './assets/images/icon-sun.svg';
            themeToggleIcon.alt = 'Switch to light mode';
        } else {
            themeToggleIcon.src = './assets/images/icon-moon.svg';
            themeToggleIcon.alt = 'Switch to dark mode';
        }
    }
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        updateThemeIcon();
    });
    updateThemeIcon();

    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.getAttribute('data-filter');
            renderExtensions();
        });
    });

    // Search functionality
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            renderExtensions();
        });
    }

    // Modal logic
    modalCancel.addEventListener('click', () => {
        removeModal.style.display = 'none';
        pendingRemoveIdx = null;
    });
    modalConfirm.addEventListener('click', () => {
        if (pendingRemoveIdx !== null) {
            extensionsData.splice(pendingRemoveIdx, 1);
            renderExtensions();
        }
        removeModal.style.display = 'none';
        pendingRemoveIdx = null;
    });

    // Render extensions
    function renderExtensions() {
        extensionsContainer.innerHTML = '';
        let filtered = extensionsData.filter(ext => {
            if (currentFilter === 'all') return true;
            if (currentFilter === 'active') return ext.isActive;
            if (currentFilter === 'inactive') return !ext.isActive;
        }).filter(ext => {
            if (!searchQuery) return true;
            return (
                ext.name.toLowerCase().includes(searchQuery) ||
                ext.description.toLowerCase().includes(searchQuery)
            );
        });
        filtered.forEach((extension, idx) => {
            const card = document.createElement('div');
            card.className = 'extension-card';
            // Set a unique background color per extension
            const extKey = extension.name.toLowerCase();
            card.style.background = cardBgMap[extKey] || '#232946';
            card.innerHTML = `
                <img src="${extension.logo}" alt="${extension.name}" class="extension-logo">
                <h3>${extension.name}</h3>
                <p>${extension.description}</p>
                <button class="remove-btn" data-idx="${idx}">Remove</button>
                <div class="toggle-switch">
                    <input type="checkbox" id="toggle-${idx}" ${extension.isActive ? 'checked' : ''}>
                    <label class="toggle-slider" for="toggle-${idx}"></label>
                </div>
            `;
            extensionsContainer.appendChild(card);
        });
        // Add event listeners for toggles and remove buttons
        document.querySelectorAll('.toggle-switch input[type="checkbox"]').forEach((toggle, i) => {
            toggle.addEventListener('change', (e) => {
                const extIdx = filtered[i] ? extensionsData.indexOf(filtered[i]) : i;
                extensionsData[extIdx].isActive = toggle.checked;
                renderExtensions();
            });
        });
        document.querySelectorAll('.remove-btn').forEach((btn, i) => {
            btn.addEventListener('click', () => {
                const extIdx = filtered[i] ? extensionsData.indexOf(filtered[i]) : i;
                pendingRemoveIdx = extensionsData.indexOf(filtered[i]);
                removeModal.style.display = 'flex';
            });
        });
    }
}); 