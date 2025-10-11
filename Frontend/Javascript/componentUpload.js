 document.addEventListener("DOMContentLoaded", function() {
        
        /**
         * Fetches an HTML component and its corresponding CSS file.
         */
        const loadComponent = (componentName) => {
            const htmlUrl = `../components/${componentName}.html`;
            const cssUrl = `../css/${componentName}.css`;
            const placeholderId = `${componentName}-placeholder`;

            // Load the component's specific CSS file if it hasn't been loaded already
            if (!document.querySelector(`link[href="${cssUrl}"]`)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = cssUrl;
                document.head.appendChild(link);
            }

            // Fetch and inject the component's HTML content
            fetch(htmlUrl)
                .then(response => {
                    if (!response.ok) throw new Error(`Could not load ${htmlUrl}`);
                    return response.text();
                })
                .then(data => {
                    const placeholder = document.getElementById(placeholderId);
                    if (placeholder) {
                        placeholder.innerHTML = data;
                    }
                    
                    // After injecting the HTML, run component-specific logic
                    if (componentName === 'sidebar') {
                        setActiveSidebarLink();
                    }
                    if (componentName === 'topbar') {
                        updateUserProfileDisplay();
                    }
                })
                .catch(error => console.error(`Error loading component '${componentName}':`, error));
        };

        /**
         * Finds the current page and applies the '.active' class to the correct sidebar item.
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
                            // If the user has a custom avatar, use it.
                            // Prepend the backend domain to the relative path.
                            userAvatarElement.src = `${backendDomain}${currentUser.avatarUrl}`;
                        } else {
                            // Otherwise, fall back to the dynamic Pravatar image.
                            userAvatarElement.src = `https://i.pravatar.cc/40?u=${currentUser.id}`;
                        }
                        userAvatarElement.alt = `${currentUser.username}'s Avatar`;
                    }
                }
            } catch (e) {
                console.error("Could not update user profile in top bar:", e);
            }
        };

        // --- INITIALIZATION ---
        loadComponent('sidebar');
        loadComponent('topbar');
    });