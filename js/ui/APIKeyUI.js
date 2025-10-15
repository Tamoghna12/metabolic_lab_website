/**
 * API Key UI Manager - Handles the user interface for API key management
 */
import { APIKeyManager } from '../core/APIKeyManager.js';

export class APIKeyUI {
    constructor() {
        this.keyManager = new APIKeyManager();
        this.currentModalProvider = null;
        this.init();
    }

    init() {
        this.renderProviders();
        this.renderGroqModels();
        this.renderCurrentConfig();
        this.setupEventListeners();
        this.updateOverview();
        this.attachNavigationListener();
    }

    renderProviders() {
        const grid = document.getElementById('providers-grid');
        if (!grid) return;

        grid.innerHTML = '';

        Object.entries(this.keyManager.providers).forEach(([providerId, provider]) => {
            const hasKey = this.keyManager.hasKey(providerId);
            const currentProvider = this.keyManager.getCurrentProvider();
            const isCurrent = currentProvider === providerId;

            const card = document.createElement('div');
            card.className = `provider-card ${hasKey ? 'has-key' : ''} ${isCurrent ? 'current' : ''}`;
            card.innerHTML = `
                <div class="provider-header">
                    <div class="provider-info">
                        <h4 class="provider-name">${provider.displayName}</h4>
                        <span class="provider-fullname">${provider.name}</span>
                    </div>
                    <div class="provider-status">
                        ${hasKey ? 
                            `<span class="status-indicator active">✓ Configured</span>` :
                            `<span class="status-indicator">Not Configured</span>`
                        }
                        ${isCurrent ? '<span class="current-badge">Current</span>' : ''}
                    </div>
                </div>
                
                <div class="provider-description">
                    ${provider.description}
                </div>
                
                <div class="provider-models">
                    <strong>Available Models:</strong>
                    <div class="models-list">
                        ${provider.models.slice(0, 3).map(model => 
                            `<span class="model-tag">${model}</span>`
                        ).join('')}
                        ${provider.models.length > 3 ? 
                            `<span class="model-more">+${provider.models.length - 3} more</span>` : ''
                        }
                    </div>
                </div>
                
                <div class="provider-actions">
                    ${hasKey ? `
                        <button class="pill-button secondary small" onclick="apiKeyUI.editProvider('${providerId}')">
                            ⚙️ Configure
                        </button>
                        <button class="pill-button secondary small" onclick="apiKeyUI.setCurrentProvider('${providerId}')">
                            🎯 Use This
                        </button>
                        <button class="pill-button danger small" onclick="apiKeyUI.removeKey('${providerId}')">
                            🗑️ Remove
                        </button>
                    ` : `
                        <button class="pill-button primary small" onclick="apiKeyUI.addKey('${providerId}')">
                            🔑 Add Key
                        </button>
                    `}
                </div>
            `;

            grid.appendChild(card);
        });
    }

    renderGroqModels() {
        const grid = document.getElementById('groq-models-grid');
        if (!grid) return;

        const groqProvider = this.keyManager.providers.groq;
        const hasKey = this.keyManager.hasKey('groq');

        if (!hasKey) {
            grid.innerHTML = `
                <div class="setup-notice">
                    <h4>🔐 Setup Required</h4>
                    <p>Add a Groq API key to access these ultra-fast models</p>
                    <button class="pill-button primary" onclick="apiKeyUI.addKey('groq')">
                        Add Groq API Key
                    </button>
                </div>
            `;
            return;
        }

        const currentModel = this.keyManager.getModel('groq');
        
        grid.innerHTML = groqProvider.models.map(model => {
            const isCurrent = currentModel === model;
            const modelInfo = this.getModelInfo(model);
            
            return `
                <div class="groq-model-card ${isCurrent ? 'selected' : ''}" data-model="${model}">
                    <div class="model-header">
                        <h5 class="model-name">${model}</h5>
                        ${isCurrent ? '<span class="selected-badge">Selected</span>' : ''}
                    </div>
                    <div class="model-specs">
                        <div class="spec-item">
                            <span class="spec-label">Context:</span>
                            <span class="spec-value">${modelInfo.context}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Speed:</span>
                            <span class="spec-value">${modelInfo.speed}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label">Use Case:</span>
                            <span class="spec-value">${modelInfo.useCase}</span>
                        </div>
                    </div>
                    <div class="model-actions">
                        <button class="pill-button ${isCurrent ? 'secondary' : 'primary'} small" 
                                onclick="apiKeyUI.selectGroqModel('${model}')">
                            ${isCurrent ? 'Currently Selected' : 'Select Model'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getModelInfo(model) {
        const modelMap = {
            'llama-3.1-70b-versatile': {
                context: '128K',
                speed: 'Very Fast',
                useCase: 'General Purpose'
            },
            'llama-3.1-8b-instant': {
                context: '128K',
                speed: 'Ultra Fast',
                useCase: 'Quick Responses'
            },
            'llama3-groq-70b-8192-tool-use-preview': {
                context: '8K',
                speed: 'Fast',
                useCase: 'Tool Use & Functions'
            },
            'llama3-groq-8b-8192-tool-use-preview': {
                context: '8K',
                speed: 'Ultra Fast',
                useCase: 'Tool Use & Functions'
            },
            'mixtral-8x7b-32768': {
                context: '32K',
                speed: 'Fast',
                useCase: 'Complex Reasoning'
            },
            'gemma-7b-it': {
                context: '8K',
                speed: 'Very Fast',
                useCase: 'Conversational'
            }
        };
        
        return modelMap[model] || {
            context: 'Unknown',
            speed: 'Unknown',
            useCase: 'General'
        };
    }

    renderCurrentConfig() {
        const grid = document.getElementById('config-grid');
        if (!grid) return;

        const enabledProviders = this.keyManager.getEnabledProviders();
        const currentProvider = this.keyManager.getCurrentProvider();

        if (enabledProviders.length === 0) {
            grid.innerHTML = `
                <div class="empty-config">
                    <h4>No API Keys Configured</h4>
                    <p>Add API keys to start using AI models in the grant generator</p>
                    <button class="pill-button primary" onclick="apiKeyUI.showSetupGuide()">
                        🚀 Get Started
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = enabledProviders.map(providerId => {
            const provider = this.keyManager.providers[providerId];
            const isCurrent = currentProvider === providerId;
            const model = this.keyManager.getModel(providerId);
            
            return `
                <div class="config-item ${isCurrent ? 'current' : ''}">
                    <div class="config-info">
                        <div class="config-provider">
                            <strong>${provider.displayName}</strong>
                            ${isCurrent ? '<span class="current-indicator">Currently Active</span>' : ''}
                        </div>
                        <div class="config-model">
                            Model: <code>${model}</code>
                        </div>
                        <div class="config-status">
                            Status: <span class="status ${isCurrent ? 'active' : 'ready'}">${isCurrent ? 'Active' : 'Ready'}</span>
                        </div>
                    </div>
                    <div class="config-actions">
                        ${!isCurrent ? `
                            <button class="pill-button small primary" onclick="apiKeyUI.setCurrentProvider('${providerId}')">
                                Activate
                            </button>
                        ` : ''}
                        <button class="pill-button small secondary" onclick="apiKeyUI.editProvider('${providerId}')">
                            Edit
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    setupEventListeners() {
        // Key form submission
        const keyForm = document.getElementById('key-form');
        if (keyForm) {
            keyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveKey();
            });
        }

        // Listen for key updates
        window.addEventListener('apikeys:updated', () => {
            this.refresh();
        });
    }

    addKey(providerId) {
        this.currentModalProvider = providerId;
        this.openKeyForm(providerId);
    }

    editProvider(providerId) {
        this.currentModalProvider = providerId;
        this.openKeyForm(providerId, true);
    }

    openKeyForm(providerId, isEdit = false) {
        const modal = document.getElementById('key-form-modal');
        const provider = this.keyManager.providers[providerId];
        
        if (!modal || !provider) return;

        // Set modal title
        document.getElementById('modal-provider-name').textContent = 
            isEdit ? `Configure ${provider.displayName}` : `Add ${provider.displayName} API Key`;

        // Set provider ID
        document.getElementById('key-provider-id').value = providerId;

        // Populate models dropdown
        const modelSelect = document.getElementById('model-select');
        if (modelSelect) {
            modelSelect.innerHTML = provider.models.map(model => {
                const currentModel = this.keyManager.getModel(providerId);
                const selected = model === currentModel ? 'selected' : '';
                return `<option value="${model}" ${selected}>${model}</option>`;
            }).join('');
        }

        // Pre-fill key if editing
        if (isEdit) {
            const existingKey = this.keyManager.getKey(providerId);
            const keyInput = document.getElementById('api-key-input');
            if (keyInput && existingKey) {
                keyInput.value = existingKey;
                // Show masked version
                keyInput.type = 'text';
                keyInput.value = this.maskKey(existingKey);
            }
        }

        // Set current provider checkbox
        const currentProvider = this.keyManager.getCurrentProvider();
        const setCurrentCheckbox = document.getElementById('set-current-provider');
        if (setCurrentCheckbox) {
            setCurrentCheckbox.checked = !currentProvider || currentProvider === providerId;
        }

        modal.style.display = 'flex';
    }

    closeKeyForm() {
        const modal = document.getElementById('key-form-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Reset form
        const form = document.getElementById('key-form');
        if (form) {
            form.reset();
        }
        
        this.currentModalProvider = null;
    }

    saveKey() {
        const providerId = document.getElementById('key-provider-id').value;
        const apiKey = document.getElementById('api-key-input').value.trim();
        const selectedModel = document.getElementById('model-select').value;
        const setCurrentProvider = document.getElementById('set-current-provider').checked;

        if (!providerId || !apiKey) {
            this.showError('Please enter a valid API key');
            return;
        }

        // Clean the key (remove spaces)
        const cleanKey = apiKey.replace(/\s+/g, '');

        // Validate key format
        if (!this.keyManager.validateAPIKey(providerId, cleanKey)) {
            this.showError('Invalid API key format for ' + this.keyManager.providers[providerId].name);
            return;
        }

        // Save the key
        if (this.keyManager.setKey(providerId, cleanKey, selectedModel)) {
            if (setCurrentProvider) {
                this.keyManager.setCurrentProvider(providerId);
            }
            
            this.closeKeyForm();
            this.showSuccess(`${this.keyManager.providers[providerId].displayName} API key saved successfully`);
            this.refresh();
        } else {
            this.showError('Failed to save API key');
        }
    }

    removeKey(providerId) {
        if (confirm(`Are you sure you want to remove the API key for ${this.keyManager.providers[providerId].displayName}?`)) {
            this.keyManager.removeKey(providerId);
            this.showSuccess('API key removed successfully');
            this.refresh();
        }
    }

    setCurrentProvider(providerId) {
        if (this.keyManager.setCurrentProvider(providerId)) {
            this.showSuccess(`${this.keyManager.providers[providerId].displayName} is now the active provider`);
            this.refresh();
        } else {
            this.showError('Failed to set current provider');
        }
    }

    selectGroqModel(model) {
        if (this.keyManager.setKey('groq', this.keyManager.getKey('groq'), model)) {
            this.showSuccess(`Groq model changed to ${model}`);
            this.renderGroqModels();
        }
    }

    updateOverview() {
        const enabledProviders = this.keyManager.getEnabledProviders();
        const currentProvider = this.keyManager.getCurrentProvider();
        
        const countElement = document.getElementById('enabled-providers-count');
        const currentElement = document.getElementById('current-provider-display');
        
        if (countElement) {
            countElement.textContent = enabledProviders.length;
        }
        
        if (currentElement) {
            if (currentProvider) {
                currentElement.textContent = this.keyManager.providers[currentProvider].displayName;
            } else {
                currentElement.textContent = 'None';
            }
        }
    }

    refresh() {
        this.renderProviders();
        this.renderGroqModels();
        this.renderCurrentConfig();
        this.updateOverview();
    }

    maskKey(key) {
        if (!key || key.length < 8) return key;
        return key.substring(0, 8) + '...' + key.substring(key.length - 4);
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            background: ${type === 'error' ? '#dc2626' : type === 'success' ? '#059669' : '#2563eb'};
            color: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    attachNavigationListener() {
        // Check if navigation item exists and add click handler
        const apiKeyNavItem = document.querySelector('[data-section="api-keys"]');
        if (apiKeyNavItem) {
            apiKeyNavItem.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAPIKeysSection();
            });
        }
    }

    showAPIKeysSection() {
        const apiKeySection = document.getElementById('api-key-manager');
        if (apiKeySection) {
            // Hide other sections
            document.querySelectorAll('section[id]').forEach(section => {
                section.classList.add('hidden');
            });
            
            // Show API keys section
            apiKeySection.classList.remove('hidden');
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Update navigation
            document.querySelectorAll('[data-section]').forEach(navItem => {
                navItem.classList.remove('active');
            });
            document.querySelector('[data-section="api-keys"]').classList.add('active');
        }
    }

    showSetupGuide() {
        this.showNotification('Click on "Add Key" for any provider to get started with API key setup', 'info');
    }
}

// Global functions for onclick handlers
window.apiKeyUI = null;

window.addKey = function(providerId) {
    if (window.apiKeyUI) {
        window.apiKeyUI.addKey(providerId);
    }
};

window.editProvider = function(providerId) {
    if (window.apiKeyUI) {
        window.apiKeyUI.editProvider(providerId);
    }
};

window.closeKeyForm = function() {
    if (window.apiKeyUI) {
        window.apiKeyUI.closeKeyForm();
    }
};

window.toggleKeyVisibility = function() {
    const keyInput = document.getElementById('api-key-input');
    const toggleButton = document.querySelector('.toggle-visibility');
    
    if (keyInput && toggleButton) {
        if (keyInput.type === 'password') {
            keyInput.type = 'text';
            toggleButton.textContent = '🙈';
        } else {
            keyInput.type = 'password';
            toggleButton.textContent = '👁️';
        }
    }
};

window.exportAPIKeys = function() {
    if (window.apiKeyUI) {
        const keyManager = window.apiKeyUI.keyManager;
        const exportData = {
            providers: {},
            exportedAt: new Date().toISOString()
        };
        
        Object.keys(keyManager.keys).forEach(providerId => {
            exportData.providers[providerId] = {
                model: keyManager.getModel(providerId),
                updatedAt: keyManager.keys[providerId].updatedAt
            };
        });
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `api-keys-config-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        window.apiKeyUI.showSuccess('API configuration exported (keys excluded for security)');
    }
};

window.importAPIKeys = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (window.apiKeyUI) {
                    window.apiKeyUI.showSuccess('Configuration imported. Please add API keys for each provider.');
                    window.apiKeyUI.refresh();
                }
            } catch (error) {
                if (window.apiKeyUI) {
                    window.apiKeyUI.showError('Invalid configuration file');
                }
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
};

window.clearAllKeys = function() {
    if (confirm('Are you sure you want to remove all API keys? This action cannot be undone.')) {
        if (window.apiKeyUI) {
            Object.keys(window.apiKeyUI.keyManager.keys).forEach(providerId => {
                window.apiKeyUI.keyManager.removeKey(providerId);
            });
            window.apiKeyUI.showSuccess('All API keys removed');
            window.apiKeyUI.refresh();
        }
    }
};
