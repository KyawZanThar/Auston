document.addEventListener('DOMContentLoaded', () => {
    // Select elements that will display dynamic data
    const profileEmail = document.getElementById('profile-email');
    const profileUniversityId = document.getElementById('profile-university-id');
    const profileRole = document.getElementById('profile-role');
    const profileRegDate = document.getElementById('profile-reg-date');
    const logoutBtn = document.getElementById('logoutBtn');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const changePasswordBtn = document.getElementById('changePasswordBtn');

    
    // --- 1. Check for token and fetch user data ---
    const token = localStorage.getItem('mock_token');
    if (!token) {
        // If no token is found, redirect to the login page
        window.location.href = '/login.html'; // Adjust this path if needed
        return;
    }

    // ==========================================================
    // --- START: IFRAME MODAL LOGIC (Integrated Block) ---
    // ==========================================================

    // 1. Select all the elements needed for the modal
    const openModalBtn = document.getElementById('open-modal-btn');
    const iframeModal = document.getElementById('iframe-modal');
    const closeModalBtn = document.getElementById('iframe-close-btn');

    // 2. Safety Check: Only run this code if all modal elements exist on the page
    if (openModalBtn && iframeModal && closeModalBtn) {

        // 3. Define the functions to show and hide the modal
        const openModal = () => {
            iframeModal.classList.add('active');
            document.body.classList.add('modal-open'); // Prevents background scrolling
        };

        const closeModal = () => {
            iframeModal.classList.remove('active');
            document.body.classList.remove('modal-open');
        };

        // 4. Attach all the event listeners
        openModalBtn.addEventListener('click', openModal);
        closeModalBtn.addEventListener('click', closeModal);

        // Listener to close the modal with the 'Escape' key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && iframeModal.classList.contains('active')) {
                closeModal();
            }
        });

    } else {
        // This warning is helpful for debugging if the HTML changes
        console.warn("Modal elements not found. Modal functionality will be disabled.");
    }

    // ==========================================================
    // --- END: IFRAME MODAL LOGIC ---
    // ==========================================================
    // --- 2. Function to populate the profile fields ---
    const populateProfileData = (user) => {
        if (!user) {
            console.error('User data is not available.');
            return;
        }
        
        profileEmail.textContent = user.email || 'N/A';
        profileUniversityId.textContent = user.austonId ? `${user.austonId} (Read-Only)` : 'N/A';
        profileRole.textContent = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A';
        
        // Format the registration date
        if (user.createdAt) {
            const date = new Date(user.createdAt);
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            profileRegDate.textContent = date.toLocaleDateString('en-US', options);
        } else {
            profileRegDate.textContent = 'N/A';
        }
    };

    // --- 3. Fetch user profile from the backend ---
    const fetchUserProfile = async () => {
        try {
            const response = await fetch(`${backendDomain}/api/users/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Send the token for authentication
                }
            });

            if (!response.ok) {
                // If the token is invalid or expired, clear it and redirect to login
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token');
                    window.location.href = '/login.html';
                }
                throw new Error('Failed to fetch user profile.');
            }

            const user = await response.json();
            populateProfileData(user);

        } catch (error) {
            console.error('Error fetching profile:', error);
            // Optionally display an error message to the user
        }
    };

    // --- 4. Event Listeners ---
    
    // Logout Button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Remove the token and user data from local storage
            localStorage.removeItem('token');
            localStorage.removeItem('user'); // Also clear user object if you stored it
            
            // Redirect to the login page
            window.location.href = '/login.html'; // Adjust path if needed
        });
    }

    // Edit Profile Button (can redirect to an edit page or open a modal)
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            // For now, an alert. This could redirect to a settings page.
            alert('Redirecting to the profile edit page is not yet implemented.');
            // window.location.href = '/settings.html';
        });
    }
    
    // Change Password Button (can open a modal)
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', () => {
            alert('The "Change Password" modal is not yet implemented.');
        });
    }

    // --- 5. Initial call to fetch and display data ---
    fetchUserProfile();
});