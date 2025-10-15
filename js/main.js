// Main application entry point - simplified version
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        console.log('Initializing BioAI Lab application...');
        
        // Wait for fonts to load
        if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
        }
        
        // Load components
        await loadComponents();
        
        // Initialize form handlers
        initializeFormHandlers();
        
        // Initialize prompt insertion
        initializePrompts();
        
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        showError('Failed to load the website. Please refresh the page.');
    }
}

async function loadComponents() {
    const components = [
        'components/header.html',
        'components/hero.html', 
        'components/research-card.html',
        'components/team-card.html',
        'components/publications-with-filter.html',
        'components/partners.html',
        'components/grant-generator-ai.html',
        'components/contact-form.html',
        'components/footer.html'
    ];
    
    const appContainer = document.getElementById('app');
    if (!appContainer) {
        throw new Error('App container not found');
    }
    
    for (const component of components) {
        try {
            const response = await fetch(component);
            if (!response.ok) {
                console.warn(`Failed to load component: ${component}`);
                continue;
            }
            const html = await response.text();
            appContainer.innerHTML += html;
        } catch (error) {
            console.warn(`Error loading component ${component}:`, error);
        }
    }
    
    // Initialize components after they're loaded
    initializeComponents();
}

function initializeComponents() {
    // Initialize smooth scrolling
    setupSmoothScrolling();
    
    // Initialize character counter
    setupCharacterCounter();
    
    // Initialize model selection
    setupModelSelection();
    
    // Initialize publication filtering
    setupPublicationFiltering();
    
    // Initialize animations
    setupAnimations();
    
    // Initialize bio link interactions
    setupBioLinkInteractions();
}

function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = 100; // Account for sticky header
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update active nav link
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

function setupCharacterCounter() {
    const projectDescription = document.getElementById('project-description');
    const charCount = document.getElementById('char-count');
    
    if (projectDescription && charCount) {
        projectDescription.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count;
            
            // Add warning color if approaching limit
            if (count > 900) {
                charCount.style.color = 'var(--color-error, #dc2626)';
            } else if (count > 800) {
                charCount.style.color = 'var(--color-warning, #f59e0b)';
            } else {
                charCount.style.color = 'var(--color-text-secondary)';
            }
        });
    }
}

function setupModelSelection() {
    const modelCards = document.querySelectorAll('.model-card');
    const selectedModelInput = document.getElementById('selected-model');
    
    modelCards.forEach(card => {
        card.addEventListener('click', function() {
            const modelId = this.getAttribute('data-model');
            
            // Remove selected class from all cards
            modelCards.forEach(c => c.classList.remove('selected'));
            
            // Add selected class to clicked card
            this.classList.add('selected');
            
            // Update hidden input
            if (selectedModelInput) {
                selectedModelInput.value = modelId;
            }
        });
    });
}

function setupPublicationFiltering() {
    const filterButtons = document.querySelectorAll('.filter-button');
    const publicationItems = document.querySelectorAll('.publication-item');
    
    if (filterButtons.length === 0) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const year = this.getAttribute('data-year');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter publications
            publicationItems.forEach(item => {
                if (year === 'all' || item.getAttribute('data-year') === year) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

function setupAnimations() {
    // Add intersection observer for fade-in animations
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        },
        { threshold: 0.1 }
    );
    
    // Observe elements with animation classes
    document.querySelectorAll('.fade-in, .slide-in').forEach(element => {
        observer.observe(element);
    });
}

function initializeFormHandlers() {
    // Grant form submission
    const grantForm = document.getElementById('grant-form');
    if (grantForm) {
        grantForm.addEventListener('submit', function(e) {
            e.preventDefault();
            window.generateProposal();
        });
    }
    
    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            window.handleContactSubmission();
        });
    }
}

function initializePrompts() {
    // All prompt-related functions
    window.insertPrompt = function(promptText) {
        const projectDescription = document.getElementById('project-description');
        if (projectDescription) {
            const currentValue = projectDescription.value || '';
            const newValue = currentValue ? 
                currentValue + '\n\n' + promptText : 
                promptText;
            
            projectDescription.value = newValue;
            
            // Update character count
            const charCount = document.getElementById('char-count');
            if (charCount) {
                charCount.textContent = newValue.length;
                
                // Update color based on count
                if (newValue.length > 900) {
                    charCount.style.color = 'var(--color-error, #dc2626)';
                } else if (newValue.length > 800) {
                    charCount.style.color = 'var(--color-warning, #f59e0b)';
                } else {
                    charCount.style.color = 'var(--color-text-secondary)';
                }
            }
            
            // Focus the textarea
            projectDescription.focus();
            
            // Set cursor to end of inserted text
            projectDescription.setSelectionRange(newValue.length, newValue.length);
            
            showNotification('Prompt inserted! Customize the brackets to fit your research.');
            
            // Scroll to form
            projectDescription.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };
    
    window.showAgencyTemplate = function() {
        const agencySelect = document.getElementById('funding-agency');
        const templateDiv = document.getElementById('agency-template');
        const contentDiv = document.getElementById('template-content');
        
        if (!agencySelect.value) {
            hideAgencyTemplate();
            return;
        }
        
        const templates = {
            'nsf': {
                title: 'NSF Grant Writing Guidance',
                items: [
                    {
                        title: 'Broader Impacts Requirement',
                        content: 'NSF requires a separate Broader Impacts section. Address: (1) teaching/training, (2) broadening participation, (3) infrastructure enhancement, (4) public understanding, and (5) societal benefits.',
                        action: 'Insert NSF Broader Impacts template'
                    },
                    {
                        title: 'Intellectual Merit Criteria',
                        content: 'Focus on advancing knowledge and understanding within your field. Emphasize novelty, methodological rigor, and potential to transform the field.',
                        action: 'Insert Intellectual Merit template'
                    }
                ]
            },
            'nih': {
                title: 'NIH Grant Writing Guidance',
                items: [
                    {
                        title: 'Specific Aims (Page 1)',
                        content: 'Clearly state your hypothesis, specific aims (2-3), and long-term objectives. Include significance, innovation, and approach summaries.',
                        action: 'Insert NIH Specific Aims template'
                    },
                    {
                        title: 'Significance Section',
                        content: 'Explain why your research matters. Discuss the problem, knowledge gaps, and how your work will advance the field.',
                        action: 'Insert Significance template'
                    }
                ]
            }
        };
        
        const template = templates[agencySelect.value];
        if (template && contentDiv) {
            let htmlContent = '<div class="template-intro"><p>' + template.title + '</p></div>';
            
            template.items.forEach((item, index) => {
                htmlContent += `
                    <div class="template-item">
                        <strong>${item.title}</strong>
                        <p>${item.content}</p>
                        <button class="template-action" onclick="insertTemplatePrompt('${agencySelect.value}', ${index})">
                            ${item.action}
                        </button>
                    </div>
                `;
            });
            
            contentDiv.innerHTML = htmlContent;
            templateDiv.classList.remove('hidden');
        }
    };
    
    window.hideAgencyTemplate = function() {
        const templateDiv = document.getElementById('agency-template');
        if (templateDiv) {
            templateDiv.classList.add('hidden');
        }
    };
    
    window.insertTemplatePrompt = function(agency, itemIndex) {
        const agencyTemplates = {
            'nsf': [
                'Broader Impacts: This project will (1) advance education through training graduate students in cutting-edge [research area] techniques, (2) broaden participation by engaging underrepresented groups in [specific activities], (3) enhance infrastructure through development of [tools/databases], (4) improve public understanding via [outreach activities], and (5) create societal benefits through [applications to society].',
                'Intellectual Merit: This research will advance knowledge in [field] by developing novel [approach] that addresses fundamental challenges in [specific problem]. Our innovative methodology combines [technique A] with [technique B] to achieve breakthroughs in [outcome].'
            ],
            'nih': [
                'Specific Aims: (1) Aim 1: Develop [innovative approach] to address [critical knowledge gap] in [disease/condition]; (2) Aim 2: Validate [approach] through [rigorous methodology] to establish [specific outcomes]. Long-term goal: Improve [health outcome] for [patient population].',
                'Significance: [Disease/condition] affects [X] million people annually and contributes to [public health burden]. Our research addresses critical gaps in understanding [mechanism/process].'
            ]
        };
        
        const prompts = agencyTemplates[agency] || [];
        const prompt = prompts[itemIndex] || '';
        
        if (prompt) {
            window.insertPrompt(prompt);
        }
    };
    
    window.generateProposal = async function() {
        const form = document.getElementById('grant-form');
        if (!form) return;
        
        if (!form.checkValidity()) {
            showNotification('Please fill in all required fields');
            return;
        }
        
        // Get form data
        const formData = {
            researchArea: document.getElementById('research-area').value,
            projectTitle: document.getElementById('project-title').value,
            projectDescription: document.getElementById('project-description').value,
            fundingAgency: document.getElementById('funding-agency').value,
            grantType: document.getElementById('grant-type').value,
            budget: document.getElementById('budget').value,
            duration: document.getElementById('duration').value,
            model: document.getElementById('selected-model').value || 'gpt4-research'
        };
        
        // Show loading state
        const button = form.querySelector('.generate-button');
        const buttonText = button?.querySelector('.button-text');
        const buttonLoading = button?.querySelector('.button-loading');
        
        if (buttonText) buttonText.style.display = 'none';
        if (buttonLoading) buttonLoading.style.display = 'inline';
        
        try {
            // Generate proposal (simulated)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const proposal = generateSampleProposal(formData);
            displayProposal(proposal);
            showNotification('Proposal generated successfully!');
            
        } catch (error) {
            console.error('Error generating proposal:', error);
            showNotification('Error generating proposal. Please try again.');
        } finally {
            // Reset button state
            if (buttonText) buttonText.style.display = 'inline';
            if (buttonLoading) buttonLoading.style.display = 'none';
        }
    };
    
    function displayProposal(proposal) {
        const outputPanel = document.getElementById('grant-output');
        const proposalContent = document.getElementById('proposal-content');
        
        if (outputPanel && proposalContent) {
            proposalContent.innerHTML = `<pre class="proposal-text">${proposal}</pre>`;
            outputPanel.style.display = 'block';
            
            // Scroll to output panel
            outputPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    function generateSampleProposal(formData) {
        return `# ${formData.projectTitle || 'Research Grant Proposal'}

## Executive Summary

${formData.projectDescription}

## Research Focus

This project focuses on ${formData.researchArea} to address critical challenges in the field.

## Objectives

- Develop innovative approaches to solve key problems
- Generate significant research outcomes
- Contribute to scientific advancement

## Expected Outcomes

Publications in high-impact journals, development of new methodologies, and broader impact on the scientific community.

## Budget and Timeline

**Budget:** ${formData.budget}
**Duration:** ${formData.duration}
**Funding Agency:** ${formData.fundingAgency}

This proposal demonstrates scientific excellence and innovation potential with clear pathways to success.`;
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: hsl(210 50% 81%);
        color: hsl(210 30% 20%);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        border: 1px solid hsl(210 40% 60%);
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease-out;
        font-family: var(--font-body, 'Inter', sans-serif);
        font-size: 0.875rem;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            text-align: center;
            z-index: 9999;
            font-family: var(--font-body, 'Inter', sans-serif);
        ">
            <h3 style="color: #dc2626; margin-bottom: 1rem;">Error</h3>
            <p style="color: #6b7280; margin-bottom: 1.5rem;">${message}</p>
            <button onclick="location.reload()" style="
                background: hsl(210 50% 81%);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
            ">Reload Page</button>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
}

// Add global utility functions for copying, downloading etc.
window.copyProposal = function() {
    const content = document.getElementById('proposal-content');
    if (content) {
        const text = content.innerText || content.textContent;
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Proposal copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
            showNotification('Failed to copy proposal');
        });
    }
};

window.downloadProposal = function() {
    const content = document.getElementById('proposal-content');
    if (content) {
        const text = content.innerText || content.textContent;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grant-proposal-${Date.now()}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
        showNotification('Proposal downloaded successfully!');
    }
};

window.editProposal = function() {
    const content = document.getElementById('proposal-content');
    if (content) {
        content.contentEditable = true;
        content.focus();
        showNotification('You can now edit the proposal. Click outside to save changes.');
        
        content.addEventListener('blur', function() {
            content.contentEditable = false;
            showNotification('Changes saved locally');
        }, { once: true });
    }
};

window.regenerateProposal = function() {
    const form = document.getElementById('grant-form');
    if (form) {
        window.generateProposal();
    }
};

window.shareProposal = function() {
    const content = document.getElementById('proposal-content');
    if (content) {
        const text = content.innerText || content.textContent;
        
        if (navigator.share) {
            navigator.share({
                title: 'Grant Proposal',
                text: text.substring(0, 500) + '...',
                url: window.location.href
            }).then(() => {
                showNotification('Proposal shared successfully!');
            }).catch(err => {
                copyShareableLink(text);
            });
        } else {
            copyShareableLink(text);
        }
    }
};

function copyShareableLink(text) {
    const shareableText = `${document.getElementById('project-title')?.value || 'Grant Proposal'} - ${text.substring(0, 200)}...`;
    navigator.clipboard.writeText(shareableText).then(() => {
        showNotification('Shareable text copied to clipboard!');
    });
}

window.toggleAdvancedOptions = function() {
    const advancedFields = document.getElementById('advanced-fields');
    const optionsText = document.getElementById('options-text');
    const arrow = document.querySelector('.arrow');
    
    if (advancedFields && optionsText && arrow) {
        if (advancedFields.style.display === 'none') {
            advancedFields.style.display = 'grid';
            optionsText.textContent = 'Hide Advanced Options';
            arrow.classList.add('active');
        } else {
            advancedFields.style.display = 'none';
            optionsText.textContent = 'Show Advanced Options';
            arrow.classList.remove('active');
        }
    }
}

// Bio Link Interactions
function setupBioLinkInteractions() {
    const bioLinks = document.querySelectorAll('.bio-link');
    
    bioLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Add loading animation
            const originalContent = link.innerHTML;
            link.innerHTML = '<span class="loading-spinner"></span> Loading...';
            link.style.opacity = '0.7';
            link.style.pointerEvents = 'none';
            
            // Track navigation
            if (typeof gtag !== 'undefined') {
                gtag('event', 'bio_view', {
                    'page_title': link.getAttribute('href'),
                    'page_location': window.location.href
                });
            }
            
            // Reset after a delay (in case navigation fails)
            setTimeout(() => {
                link.innerHTML = originalContent;
                link.style.opacity = '1';
                link.style.pointerEvents = 'auto';
            }, 3000);
        });
    });
}
