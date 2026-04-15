/**
 * API Key Manager - Centralized API key storage and management
 */
export class APIKeyManager {
    constructor() {
        this.storageKey = 'bioai_api_keys';
        this.keys = this.loadKeys();
        this.currentProvider = null;
        this.providers = {
            openai: {
                name: 'OpenAI',
                displayName: 'OpenAI GPT',
                models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
                defaultModel: 'gpt-4',
                description: 'Leading AI models for general and research purposes'
            },
            anthropic: {
                name: 'Anthropic',
                displayName: 'Claude',
                models: ['claude-3-sonnet', 'claude-3-opus', 'claude-3-haiku'],
                defaultModel: 'claude-3-sonnet',
                description: 'Constitutional AI focused on safety and helpfulness'
            },
            google: {
                name: 'Google',
                displayName: 'Gemini',
                models: ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'],
                defaultModel: 'gemini-pro',
                description: 'Multimodal AI with strong capabilities in medical and biological sciences'
            },
            meta: {
                name: 'Meta',
                displayName: 'Llama',
                models: ['llama-3.1-70b', 'llama-3.1-8b', 'llama-3-70b', 'llama-3-8b'],
                defaultModel: 'llama-3.1-70b',
                description: 'Open source language models with strong reasoning capabilities'
            },
            mistral: {
                name: 'Mistral',
                displayName: 'Mistral',
                models: ['mistral-large', 'mistral-medium', 'mistral-small', 'mixtral-8x7b'],
                defaultModel: 'mistral-large',
                description: 'European AI models with multilingual capabilities'
            },
            groq: {
                name: 'Groq',
                displayName: 'Groq',
                models: [
                    'llama-3.1-70b-versatile',
                    'llama-3.1-8b-instant', 
                    'llama3-groq-70b-8192-tool-use-preview',
                    'llama3-groq-8b-8192-tool-use-preview',
                    'mixtral-8x7b-32768',
                    'gemma-7b-it'
                ],
                defaultModel: 'llama-3.1-70b-versatile',
                description: 'Ultra-fast inference with LPU technology'
            }
        };
        this.init();
    }

    init() {
        this.setupGlobalEventListeners();
    }

    loadKeys() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Failed to load API keys:', error);
            return {};
        }
    }

    saveKeys() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.keys));
            this.notifyKeysUpdated();
        } catch (error) {
            console.error('Failed to save API keys:', error);
        }
    }

    setKey(provider, key, model = null) {
        if (!provider || !key) return false;
        
        this.keys[provider] = {
            key: key,
            model: model || this.providers[provider]?.defaultModel,
            updatedAt: new Date().toISOString()
        };
        
        this.saveKeys();
        return true;
    }

    getKey(provider) {
        return this.keys[provider]?.key || null;
    }

    getModel(provider) {
        return this.keys[provider]?.model || this.providers[provider]?.defaultModel;
    }

    removeKey(provider) {
        delete this.keys[provider];
        this.saveKeys();
        return true;
    }

    hasKey(provider) {
        return !!this.keys[provider]?.key;
    }

    getEnabledProviders() {
        return Object.keys(this.keys).filter(provider => this.hasKey(provider));
    }

    getProviderModels(provider) {
        return this.providers[provider]?.models || [];
    }

    setCurrentProvider(provider) {
        if (this.hasKey(provider)) {
            this.currentProvider = provider;
            localStorage.setItem('bioai_current_provider', provider);
            return true;
        }
        return false;
    }

    getCurrentProvider() {
        if (this.currentProvider) return this.currentProvider;
        
        // Load from localStorage
        const saved = localStorage.getItem('bioai_current_provider');
        if (saved && this.hasKey(saved)) {
            this.currentProvider = saved;
            return saved;
        }
        
        // Return first available provider
        const enabled = this.getEnabledProviders();
        return enabled.length > 0 ? enabled[0] : null;
    }

    setupGlobalEventListeners() {
        // Listen for API key updates from UI
        window.addEventListener('apikey:set', (event) => {
            const { provider, key, model } = event.detail;
            this.setKey(provider, key, model);
        });

        window.addEventListener('apikey:remove', (event) => {
            const { provider } = event.detail;
            this.removeKey(provider);
        });

        window.addEventListener('provider:change', (event) => {
            const { provider } = event.detail;
            this.setCurrentProvider(provider);
        });
    }

    notifyKeysUpdated() {
        window.dispatchEvent(new CustomEvent('apikeys:updated', {
            detail: {
                providers: this.getEnabledProviders(),
                current: this.getCurrentProvider()
            }
        }));
    }

    // Utility methods for grant generator integration
    getProviderForGrantModel(modelId) {
        const modelMap = {
            'gpt4-research': 'openai',
            'claude-3': 'anthropic', 
            'gemini-pro': 'google',
            'llama-3': 'meta',
            'mistral': 'mistral',
            'groq': 'groq'
        };
        return modelMap[modelId] || null;
    }

    getActualModelId(modelId) {
        const provider = this.getProviderForGrantModel(modelId);
        return provider ? this.getModel(provider) : null;
    }

    validateAPIKey(provider, key) {
        if (!provider || !key) return false;
        
        // Basic validation patterns
        const patterns = {
            openai: /^sk-[A-Za-z0-9]{48}$/,
            anthropic: /^sk-ant-api03-[A-Za-z0-9_-]{95}$/,
            google: /^[A-Za-z0-9_-]{39}$/,
            meta: /^[A-Za-z0-9_-]{40,}$/,
            mistral: /^[A-Za-z0-9_-]{40,}$/,
            groq: /^gsk_[A-Za-z0-9_-]{52}$/
        };
        
        const pattern = patterns[provider];
        return pattern ? pattern.test(key) : true; // Allow custom patterns if not defined
    }
}
