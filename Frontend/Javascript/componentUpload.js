// In: Javascript/componentUpload.js (REPLACE THE ENTIRE FILE)

document.addEventListener("DOMContentLoaded", function() {
    
    /**
     * Fetches an HTML component and its corresponding CSS file.
     */
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
                
                // After injecting the HTML, run component-specific logic
                if (componentName === 'sidebar') {
                    setActiveSidebarLink();
                }
                if (componentName === 'topbar') {
                    updateUserProfileDisplay();
                    initializeProfileDropdown(); 
                }
            })
            .catch(error => console.error(`Error loading component '${componentName}':`, error));
    };

    /**
     * Finds the current page and applies the '.active' class to the correct sidebar item.
     * THIS FUNCTION FIXES THE "FOCUS EFFECT".
     */
    const setActiveSidebarLink = () => {
        const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
        setTimeout(() => {
            const listItems = document.querySelectorAll('.sidebar nav ul li[data-page]');
            listItems.forEach(li => {
                li.classList.toggle('active', li.dataset.page === currentPage);
            });
        }, 100);
    };

    /**
     * Finds the user's info in localStorage and updates the top bar display.
     * THIS FUNCTION FIXES THE USER PROFILE DISPLAY.
     */
    const updateUserProfileDisplay = () => {
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser) {
                const userNameElement = document.querySelector('.top-bar .user-name');
                const userAvatarElement = document.querySelector('.top-bar .user-avatar');

                if (userNameElement) {
                    userNameElement.textContent = currentUser.username || 'User';
                }
                if (userAvatarElement) {
                    if (currentUser.avatarUrl) {
                        userAvatarElement.src = `${backendDomain}${currentUser.avatarUrl}`;
                    } else {
                        userAvatarElement.src = `https://i.pravatar.cc/40?u=${currentUser.id}`;
                    }
                    userAvatarElement.alt = `${currentUser.username}'s Avatar`;
                }
            }
        } catch (e) {
            console.error("Could not update user profile in top bar:", e);
        }
    };

    /**
     * Attaches event listeners to make the profile dropdown work.
     */
    const initializeProfileDropdown = () => {
        const container = document.querySelector('.profile-dropdown-container');
        const button = document.getElementById('profile-menu-button');
        const logoutButton = document.getElementById('logout-button');

        if (!container || !button) {
            setTimeout(initializeProfileDropdown, 100);
            return;
        }

        button.addEventListener('click', (e) => {
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

    // Add a global listener to close the dropdown when clicking anywhere else
    window.addEventListener('click', function(e) {
        const container = document.querySelector('.profile-dropdown-container');
        if (container && !container.contains(e.target)) {
            container.classList.remove('open');
            const button = document.getElementById('profile-menu-button');
            if (button) button.setAttribute('aria-expanded', 'false');
        }
    });

    // --- INITIALIZATION ---
    loadComponent('sidebar');
    loadComponent('topbar');
});