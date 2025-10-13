// In: Javascript/componentUpload.js

document.addEventListener("DOMContentLoaded", function() {
    
    const loadComponent = (componentName) => {
        const htmlUrl = `../components/${componentName}.html`;
        const cssUrl = `../css/${componentName}.css`;
        const placeholderId = `${componentName}-placeholder`;

        if (!document.querySelector(`link[href="${cssUrl}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssUrl;
            document.head.appendChild(link);
        }

        fetch(htmlUrl)
            .then(response => response.ok ? response.text() : Promise.reject(`Failed to load ${htmlUrl}`))
            .then(data => {
                const placeholder = document.getElementById(placeholderId);
                if (placeholder) placeholder.innerHTML = data;
                
                if (componentName === 'sidebar') {
                    setActiveSidebarLink();
                }
                if (componentName === 'topbar') {
                    updateUserProfileDisplay();
                    // --- 1. ADD THIS ONE LINE ---
                    initializeProfileDropdown(); 
                }
            })
            .catch(error => console.error(`Error loading component '${componentName}':`, error));
    };

    const setActiveSidebarLink = () => {
        // ... (your existing, correct active link logic) ...
    };

    const updateUserProfileDisplay = () => {
        // ... (your existing, correct profile display logic) ...
    };

    /**
     * --- 2. ADD THIS ENTIRE NEW FUNCTION ---
     * Attaches event listeners to make the profile dropdown work.
     */
    const initializeProfileDropdown = () => {
        const container = document.querySelector('.profile-dropdown-container');
        const button = document.getElementById('profile-menu-button');
        const logoutButton = document.getElementById('logout-button');

        // This check is important. If elements aren't found, it tries again.
        if (!container || !button) {
            setTimeout(initializeProfileDropdown, 100);
            return;
        }

        button.addEventListener('click', (e) => {
            // Stop the window listener from immediately closing the dropdown
            e.stopPropagation(); 
            container.classList.toggle('open');
            const isExpanded = container.classList.contains('open');
            button.setAttribute('aria-expanded', isExpanded);
        });
        
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('mock_token');
                localStorage.removeItem('currentUser');
                window.location.href = '/HTML/login.html';
            });
        }
    };

    // Add a single, global listener to close the dropdown when clicking anywhere else
    window.addEventListener('click', function(e) {
        const container = document.querySelector('.profile-dropdown-container');
        // Check if the container exists and if the click was outside of it
        if (container && !container.contains(e.target)) {
            container.classList.remove('open');
            const button = document.getElementById('profile-menu-button');
            if (button) button.setAttribute('aria-expanded', 'false');
        }
    });

    // --- INITIALIZATION (Unchanged) ---
    loadComponent('sidebar');
    loadComponent('topbar');
});