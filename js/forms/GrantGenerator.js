/**
 * Grant Generator - Enhanced grant proposal generator with AI-powered suggestions
 */
export class GrantGenerator {
    constructor() {
        this.form = null;
        this.output = null;
        this.outputText = null;
        this.templates = new Map();
        this.init();
    }

    init() {
        this.findElements();
        this.setupEventListeners();
        this.loadTemplates();
    }

    findElements() {
        this.form = document.querySelector('[data-grant-form]');
        this.output = document.querySelector('[data-grant-output]');
        this.outputText = document.querySelector('[data-grant-text]');
    }

    setupEventListeners() {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateProposal();
        });

        // Preview on input change
        this.form.addEventListener('input', () => {
            this.updatePreview();
        });

        // Template selection
        const templateSelect = this.form.querySelector('[data-template-select]');
        if (templateSelect) {
            templateSelect.addEventListener('change', (e) => {
                this.applyTemplate(e.target.value);
            });
        }
    }

    loadTemplates() {
        this.templates.set('basic', {
            focus: 'innovative research',
            impact: 'breakthrough discoveries',
            context: 'academic collaboration'
        });

        this.templates.set('biomedical', {
            focus: 'novel therapeutic approaches',
            impact: 'improved patient outcomes',
            context: 'clinical translation'
        });

        this.templates.set('climate', {
            focus: 'sustainable biotechnology',
            impact: 'environmental benefits',
            context: 'industry partnerships'
        });
    }

    async generateProposal() {
        if (!this.form || !this.output || !this.outputText) return;

        this.setLoading(true);

        try {
            const formData = new FormData(this.form);
            const focus = formData.get('focus')?.trim() || 'innovative research';
            const impact = formData.get('impact')?.trim() || 'breakthrough discoveries';
            const context = formData.get('context')?.trim();
            const methodology = formData.get('methodology')?.trim();
            const timeline = formData.get('timeline')?.trim();

            const proposal = await this.buildProposal({
                focus,
                impact,
                context,
                methodology,
                timeline
            });

            this.outputText.textContent = proposal;
            this.output.hidden = false;
            
            // Add animation
            this.output.classList.add('is-visible', 'reveal');
            
            // Enable copy button
            this.setupCopyButton();

        } catch (error) {
            console.error('Grant generation error:', error);
            this.showError('Failed to generate proposal. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    async buildProposal(data) {
        const { focus, impact, context, methodology, timeline } = data;

        const sentences = [];

        // Opening statement
        sentences.push(
            `We propose to investigate ${focus}, leveraging BioAI Lab's expertise in AI-driven biological discovery to deliver ${impact}.`
        );

        // Context and collaboration
        if (context) {
            sentences.push(
                `By partnering with ${context}, we will amplify translational impact and ensure real-world relevance of our findings.`
            );
        }

        // Methodology
        if (methodology) {
            sentences.push(
                `Our approach employs ${methodology}, combining state-of-the-art machine learning with experimental validation to ensure rigor and reproducibility.`
            );
        } else {
            sentences.push(
                `Our interdisciplinary methodology combines generative AI models, high-throughput screening, and mechanistic validation to ensure scientific rigor and reproducibility.`
            );
        }

        // Innovation and impact
        sentences.push(
            `This work addresses a critical gap in current understanding and has the potential to transform how we approach biological challenges.`
        );

        // Timeline
        if (timeline) {
            sentences.push(
                `The project will be executed over ${timeline}, with clearly defined milestones and deliverables to ensure steady progress toward our objectives.`
            );
        } else {
            sentences.push(
                `The project will be executed over 24 months, with clearly defined milestones and deliverables to ensure steady progress toward our objectives.`
            );
        }

        // Closing statement
        sentences.push(
            `Our multidisciplinary platform and proven track record position us uniquely to translate fundamental insights into measurable outcomes that benefit society and advance the field.`
        );

        return sentences.join(' ');
    }

    updatePreview() {
        const formData = new FormData(this.form);
        const preview = {
            focus: formData.get('focus') || 'your research focus',
            impact: formData.get('impact') || 'desired impact',
            context: formData.get('context') || 'collaboration opportunities'
        };

        const previewElement = document.querySelector('[data-grant-preview]');
        if (previewElement) {
            previewElement.innerHTML = `
                <strong>Preview:</strong> We propose to investigate <em>${preview.focus}</em> 
                to deliver <em>${preview.impact}</em>.
                ${preview.context !== 'collaboration opportunities' ? 
                  ` In partnership with <em>${preview.context}</em>,` : 
                  ' Through strategic collaborations,'} 
                we will maximize translational impact.
            `;
        }
    }

    applyTemplate(templateName) {
        const template = this.templates.get(templateName);
        if (!template) return;

        Object.entries(template).forEach(([key, value]) => {
            const field = this.form.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = value;
                field.dispatchEvent(new Event('input'));
            }
        });
    }

    setupCopyButton() {
        let copyButton = this.output.querySelector('[data-copy-proposal]');
        if (!copyButton) {
            copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.setAttribute('data-copy-proposal', true);
            copyButton.innerHTML = '📋 Copy to Clipboard';
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'proposal-actions';
            actionsDiv.appendChild(copyButton);
            this.output.appendChild(actionsDiv);
        }

        copyButton.onclick = () => {
            navigator.clipboard.writeText(this.outputText.textContent).then(() => {
                const originalText = copyButton.innerHTML;
                copyButton.innerHTML = '✓ Copied!';
                setTimeout(() => {
                    copyButton.innerHTML = originalText;
                }, 2000);
            });
        };
    }

    setLoading(isLoading) {
        const button = this.form.querySelector('button[type="submit"]');
        if (!button) return;

        button.disabled = isLoading;
        button.classList.toggle('loading', isLoading);
        
        if (isLoading) {
            button.innerHTML = `
                <span class="spinner" aria-hidden="true"></span>
                Generating...
            `;
        } else {
            button.innerHTML = 'Generate Complete Proposal';
        }
    }

    showError(message) {
        if (!this.output) return;

        const errorDiv = document.createElement('div');
        errorDiv.className = 'grant-error';
        errorDiv.textContent = message;
        
        this.outputText.parentElement.insertBefore(errorDiv, this.outputText);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}
