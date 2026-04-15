import { useState, useEffect } from 'preact/hooks';

export default function GrantGenerator() {
    const [formData, setFormData] = useState({
        researchArea: '',
        projectTitle: '',
        projectDescription: '',
        fundingAgency: '',
        grantType: '',
        budget: '',
        duration: '',
        model: 'gpt4-research'
    });
    
    const [proposal, setProposal] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id.replace(/-/g, '')]: value }));
    };

    const generateProposal = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const generatedText = `# ${formData.projectTitle || 'Research Grant Proposal'}

## Executive Summary
${formData.projectDescription}

## Research Objectives
This project focuses on ${formData.researchArea} to address critical challenges in the field.

## Expected Outcomes
Advancements in sustainable biotechnology and high-impact publications.

## Budget and Timeline
- Budget: ${formData.budget}
- Duration: ${formData.duration}
- Agency: ${formData.fundingAgency}

Generated with ${formData.model} via BioAI Lab Platform.`;

        setProposal(generatedText);
        setIsLoading(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(proposal);
        alert('Proposal copied to clipboard!');
    };

    return (
        <section id="grant-generator" class="py-16 bg-surface/40">
            <div class="max-container">
                <div class="section-header">
                    <span class="section-eyebrow">AI Assistant</span>
                    <h2 class="section-title">Grant Proposal Generator</h2>
                    <p class="section-subtitle">Accelerate your research funding applications with our AI-powered proposal assistant.</p>
                </div>

                <div class="grant-container grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="grant-form-panel card-surface p-8">
                        <form id="grant-form" onSubmit={generateProposal}>
                            <div class="form-group mb-4">
                                <label for="research-area">Research Area</label>
                                <input 
                                    type="text" 
                                    id="research-area" 
                                    placeholder="e.g., C1-Gas Fermentation" 
                                    required 
                                    onInput={handleInputChange}
                                />
                            </div>

                            <div class="form-group mb-4">
                                <label for="project-title">Project Title</label>
                                <input 
                                    type="text" 
                                    id="project-title" 
                                    placeholder="Enter your project title" 
                                    required 
                                    onInput={handleInputChange}
                                />
                            </div>

                            <div class="form-group mb-4">
                                <label for="project-description">Executive Summary (Max 1000 chars)</label>
                                <textarea 
                                    id="project-description" 
                                    rows="4" 
                                    maxlength="1000" 
                                    placeholder="Describe your research goals and impact..." 
                                    required
                                    onInput={handleInputChange}
                                ></textarea>
                                <div class="char-counter text-right text-sm text-gray-500">
                                    <span id="char-count">{formData.projectDescription.length}</span>/1000
                                </div>
                            </div>

                            <div class="advanced-toggle mb-4 cursor-pointer flex items-center gap-2" onClick={() => setShowAdvanced(!showAdvanced)}>
                                <span class={`arrow transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>▶</span>
                                <span id="options-text">{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
                            </div>

                            {showAdvanced && (
                                <div id="advanced-fields" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div class="form-group">
                                        <label for="funding-agency">Funding Agency</label>
                                        <select id="funding-agency" onInput={handleInputChange}>
                                            <option value="">Select Agency</option>
                                            <option value="nsf">NSF (USA)</option>
                                            <option value="nih">NIH (USA)</option>
                                            <option value="ukri">UKRI (UK)</option>
                                            <option value="eu">Horizon Europe (EU)</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="budget">Approx. Budget</label>
                                        <input type="text" id="budget" placeholder="e.g., $500,000" onInput={handleInputChange} />
                                    </div>
                                    <div class="form-group">
                                        <label for="duration">Duration</label>
                                        <input type="text" id="duration" placeholder="e.g., 3 years" onInput={handleInputChange} />
                                    </div>
                                    <div class="form-group">
                                        <label for="selected-model">AI Model</label>
                                        <select id="selected-model" onInput={handleInputChange}>
                                            <option value="gpt4-research">GPT-4 Research</option>
                                            <option value="claude-3">Claude 3 Sonnet</option>
                                            <option value="gemini-pro">Gemini Pro</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <button type="submit" class="pill-button w-full" disabled={isLoading}>
                                {isLoading ? 'Generating Proposal...' : 'Generate Proposal'}
                            </button>
                        </form>
                    </div>

                    <div class="grant-output-panel">
                        {proposal ? (
                            <div id="grant-output" class="card-surface p-8 h-full flex flex-col">
                                <div class="flex justify-between items-center mb-4">
                                    <h3 class="text-xl font-bold">Generated Proposal</h3>
                                    <div class="flex gap-2">
                                        <button class="small-pill" onClick={copyToClipboard}>Copy</button>
                                        <button class="small-pill" onClick={() => setProposal('')}>Clear</button>
                                    </div>
                                </div>
                                <div class="proposal-content bg-background/50 p-4 rounded-lg flex-grow overflow-auto">
                                    <pre class="whitespace-pre-wrap font-sans text-sm">{proposal}</pre>
                                </div>
                            </div>
                        ) : (
                            <div class="empty-output card-surface p-8 h-full flex items-center justify-center text-gray-400 text-center">
                                <p>Enter your research details and click generate to see your proposal here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
