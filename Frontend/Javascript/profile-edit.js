// In: Frontend/Javascript/profile-edit.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selections (for elements INSIDE this page) ---
    const photoUploadInput = document.getElementById('photo-upload');
    const photoPreview = document.getElementById('photo-preview');
    const passwordToggle = document.getElementById('change-password-toggle');
    const passwordFieldsContainer = document.getElementById('password-fields-container');
    const profileForm = document.getElementById('edit-profile-form');
    const cancelBtn = document.getElementById('cancel-btn-iframe');
    const closeBtn = document.getElementById('close-btn-iframe');

    // --- Image Upload Preview Logic ---
    if (photoUploadInput && photoPreview) {
        photoUploadInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    photoPreview.innerHTML = '';
                    photoPreview.appendChild(img);
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // --- Password Fields Toggle Logic ---
    if (passwordToggle && passwordFieldsContainer) {
        passwordToggle.addEventListener('change', function() {
            passwordFieldsContainer.classList.toggle('visible', this.checked);
        });
    }
    
    // --- Form Submission Logic ---
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(profileForm);
            
            // Example of how you would send this to your Express backend
            // const response = await fetch('/api/users/profile', {
            //     method: 'PATCH',
            //     headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            //     body: formData
            // });
            // const result = await response.json();
            
            alert('Form submitted! (Backend integration needed)');
            // Tell the parent window to close the modal
            window.parent.postMessage('closeModal', '*');
        });
    }

    // --- Communication with Parent Page to Close Modal ---
    const closeTheModal = () => {
        // This sends a message to the parent window (myaccount.html)
        // The parent's script must be listening for this message to close the modal.
        window.parent.postMessage('closeModal', '*');
    };

    if (cancelBtn) cancelBtn.addEventListener('click', closeTheModal);
    if (closeBtn) closeBtn.addEventListener('click', closeTheModal);
});