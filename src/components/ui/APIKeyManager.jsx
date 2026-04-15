import { useState, useEffect } from 'preact/hooks';

const PROVIDERS = {
    openai: { name: 'OpenAI', models: ['gpt-4', 'gpt-3.5-turbo'] },
    anthropic: { name: 'Anthropic', models: ['claude-3-sonnet', 'claude-3-haiku'] },
    google: { name: 'Google', models: ['gemini-pro', 'gemini-1.5-flash'] },
    groq: { name: 'Groq', models: ['llama-3.1-70b-versatile', 'mixtral-8x7b-32768'] }
};

export default function APIKeyManager() {
    const [keys, setKeys] = useState({});
    const [activeProvider, setActiveProvider] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentEdit, setCurrentEdit] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('bioai_api_keys');
        if (stored) setKeys(JSON.parse(stored));
        
        const current = localStorage.getItem('bioai_current_provider');
        if (current) setActiveProvider(current);
    }, []);

    const saveKeys = (newKeys) => {
        setKeys(newKeys);
        localStorage.setItem('bioai_api_keys', JSON.stringify(newKeys));
    };

    const handleSaveKey = (e) => {
        e.preventDefault();
        const provider = e.target.provider.value;
        const key = e.target.key.value;
        const model = e.target.model.value;

        const newKeys = { ...keys, [provider]: { key, model } };
        saveKeys(newKeys);
        setShowModal(false);
    };

    const removeKey = (provider) => {
        const newKeys = { ...keys };
        delete newKeys[provider];
        saveKeys(newKeys);
    };

    return (
        <section id="api-keys" class="py-16 bg-background">
            <div class="max-container">
                <div class="section-header">
                    <span class="section-eyebrow">Settings</span>
                    <h2 class="section-title">API Key Management</h2>
                    <p class="section-subtitle">Configure your AI providers locally. Your keys are stored in your browser and never sent to our servers.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(PROVIDERS).map(([id, provider]) => (
                        <div key={id} class={`provider-card card-surface p-6 ${keys[id] ? 'border-success' : ''}`}>
                            <h3 class="font-bold text-lg mb-2">{provider.name}</h3>
                            <div class="text-sm text-gray-500 mb-4">
                                {keys[id] ? `Model: ${keys[id].model}` : 'Not configured'}
                            </div>
                            <div class="flex flex-wrap gap-2">
                                {keys[id] ? (
                                    <>
                                        <button class="small-pill secondary" onClick={() => { setCurrentEdit(id); setShowModal(true); }}>Edit</button>
                                        <button class="small-pill danger" onClick={() => removeKey(id)}>Remove</button>
                                    </>
                                ) : (
                                    <button class="small-pill primary" onClick={() => { setCurrentEdit(id); setShowModal(true); }}>Add Key</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {showModal && (
                    <div class="modal-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
                        <div class="modal-content card-surface p-8 max-w-md w-full">
                            <h3 class="text-xl font-bold mb-4">Configure {PROVIDERS[currentEdit].name}</h3>
                            <form onSubmit={handleSaveKey}>
                                <input type="hidden" name="provider" value={currentEdit} />
                                <div class="form-group mb-4">
                                    <label class="form-label">API Key</label>
                                    <input 
                                        type="password" 
                                        name="key" 
                                        defaultValue={keys[currentEdit]?.key || ''} 
                                        required 
                                        class="form-input"
                                        placeholder="Enter your API key"
                                    />
                                </div>
                                <div class="form-group mb-6">
                                    <label class="form-label">Default Model</label>
                                    <select name="model" class="form-input form-select">
                                        {PROVIDERS[currentEdit].models.map(m => (
                                            <option key={m} value={m} selected={m === keys[currentEdit]?.model}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div class="flex gap-4">
                                    <button type="submit" class="pill-button flex-grow">Save Configuration</button>
                                    <button type="button" class="pill-button secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
