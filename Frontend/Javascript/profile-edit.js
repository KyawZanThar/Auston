// In: Frontend/Javascript/profile-edit.js

document.addEventListener('DOMContentLoaded', () => {
    const photoUploadInput = document.getElementById('photo-upload');
    const photoPreview = document.getElementById('photo-preview');
    const passwordToggle = document.getElementById('change-password-toggle');
    const passwordFieldsContainer = document.getElementById('password-fields-container');
    const profileForm = document.getElementById('edit-profile-form');
    const cancelBtn = document.getElementById('cancel-btn-iframe');
    const closeBtn = document.getElementById('close-btn-iframe');

    // --- Image Upload Preview Logic ---
    if (photoUploadInput) {
        photoUploadInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    photoPreview.innerHTML = '';
                    photoPreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- Password Fields Toggle Logic ---
    if (passwordToggle) {
        passwordToggle.addEventListener('change', function() {
            passwordFieldsContainer.classList.toggle('visible', this.checked);
        });
    }
    
    // --- Form Submission Logic ---
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // 1. Gather all the form data
            const formData = new FormData(profileForm);
            
            // 2. Convert FormData to a plain object to send via postMessage
            const formDataObject = {};
            formData.forEach((value, key) => {
                formDataObject[key] = value;
            });

            // 3. Send a message to the PARENT window, asking it to submit the data
            // We include the form data in the message.
            window.parent.postMessage({
                type: 'submitProfileUpdate',
                payload: formDataObject
            }, '*'); // Use a specific origin in production for security
        });
    }


    // --- Communication with Parent Page to Close Modal ---
    const closeTheModal = () => {
        window.parent.postMessage({ type: 'closeModal' }, '*');
    };

    if (cancelBtn) cancelBtn.addEventListener('click', closeTheModal);
    if (closeBtn) closeBtn.addEventListener('click', closeTheModal);
});