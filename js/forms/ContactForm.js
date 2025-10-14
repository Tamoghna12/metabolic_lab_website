/**
 * Contact Form - Enhanced contact form with validation and submission handling
 */
export class ContactForm {
    constructor() {
        this.form = null;
        this.submitButton = null;
        this.formData = new Map();
        this.init();
    }

    init() {
        this.findForm();
        this.setupEventListeners();
    }

    findForm() {
        this.form = document.querySelector('[data-contact-form]');
        this.submitButton = this.form?.querySelector('button[type="submit"]');
    }

    setupEventListeners() {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Real-time validation
        this.form.addEventListener('input', (e) => {
            this.validateField(e.target);
        });

        // Focus/blur effects
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
                this.validateField(input);
            });
        });
    }

    async handleSubmit() {
        if (!this.validateForm()) {
            this.showError('Please fill in all required fields correctly.');
            return;
        }

        this.setLoading(true);
        
        try {
            // Simulate form submission (replace with actual endpoint)
            await this.submitFormData();
            this.showSuccess('Thank you for your message! We\'ll get back to you soon.');
            this.resetForm();
        } catch (error) {
            console.error('Form submission error:', error);
            this.showError('There was an error sending your message. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    validateForm() {
        const inputs = this.form.querySelectorAll('[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required.';
        }

        // Email validation
        if (fieldType === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address.';
            }
        }

        // Phone validation
        if (fieldType === 'tel' && value) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(value) || value.length < 10) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number.';
            }
        }

        // Message length validation
        if (field.tagName === 'TEXTAREA' && value) {
            const minLength = parseInt(field.dataset.minLength) || 10;
            const maxLength = parseInt(field.dataset.maxLength) || 1000;
            
            if (value.length < minLength) {
                isValid = false;
                errorMessage = `Message must be at least ${minLength} characters.`;
            } else if (value.length > maxLength) {
                isValid = false;
                errorMessage = `Message must not exceed ${maxLength} characters.`;
            }
        }

        this.updateFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    updateFieldValidation(field, isValid, errorMessage = '') {
        const fieldWrapper = field.closest('.form-field') || field.parentElement;
        
        fieldWrapper.classList.toggle('has-error', !isValid);
        fieldWrapper.classList.toggle('is-valid', isValid && field.value.trim());
        
        // Update error message
        let errorElement = fieldWrapper.querySelector('.field-error');
        if (!isValid && errorMessage) {
            if (!errorElement) {
                errorElement = document.createElement('span');
                errorElement.className = 'field-error';
                fieldWrapper.appendChild(errorElement);
            }
            errorElement.textContent = errorMessage;
        } else if (errorElement) {
            errorElement.remove();
        }
    }

    async submitFormData() {
        // Collect form data
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In a real implementation, you would send the data to your backend:
        // const response = await fetch('/api/contact', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });
        
        if (!response.ok) {
            throw new Error('Submission failed');
        }

        console.log('Form submitted:', data);
    }

    setLoading(isLoading) {
        if (!this.submitButton) return;

        this.submitButton.disabled = isLoading;
        this.submitButton.classList.toggle('loading', isLoading);
        
        if (isLoading) {
            this.submitButton.innerHTML = `
                <span class="spinner" aria-hidden="true"></span>
                Sending...
            `;
        } else {
            this.submitButton.innerHTML = 'Send Message';
        }
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessage = this.form.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.className = `form-message form-message--${type}`;
        messageElement.setAttribute('role', 'alert');
        messageElement.innerHTML = `
            <span class="message-icon">${type === 'success' ? '✓' : '⚠'}</span>
            <span class="message-text">${message}</span>
        `;

        this.form.insertBefore(messageElement, this.form.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageElement.remove();
        }, 5000);
    }

    resetForm() {
        if (!this.form) return;

        this.form.reset();
        
        // Remove validation states
        const fields = this.form.querySelectorAll('.form-field');
        fields.forEach(field => {
            field.classList.remove('has-error', 'is-valid', 'focused');
        });

        // Remove error messages
        const errorMessages = this.form.querySelectorAll('.field-error');
        errorMessages.forEach(error => error.remove());
    }
}
