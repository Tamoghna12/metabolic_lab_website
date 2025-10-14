// Core imports
import { ComponentManager } from './core/ComponentManager.js';
import { DataManager } from './core/DataManager.js';

// UI imports
import { AnimationController } from './ui/AnimationController.js';
import { DarkModeController } from './ui/DarkModeController.js';
import { SearchController } from './ui/SearchController.js';

// Form imports
import { ContactForm } from './forms/ContactForm.js';
import { GrantGenerator } from './forms/GrantGenerator.js';

// Utility imports
import { HeroKeywordRotator } from './utils/HeroKeywordRotator.js';
import { HeroStats } from './utils/HeroStats.js';

// Global controllers
let componentManager;
let dataManager;
let animationController;
let darkModeController;
let searchController;
let heroKeywordRotator;
let heroStats;
let contactForm;
let grantGenerator;

async function bootstrap() {
    try {
        // Initialize core systems
        componentManager = new ComponentManager();
        dataManager = new DataManager();
        animationController = new AnimationController();
        darkModeController = new DarkModeController();
        
        // Load all components
        await componentManager.loadAllComponents();
        
        // Load data
        const labData = await dataManager.fetchLabData();
        
        // Initialize UI controllers
        searchController = new SearchController(dataManager);
        heroKeywordRotator = new HeroKeywordRotator();
        heroStats = new HeroStats(animationController);
        
        // Initialize forms
        contactForm = new ContactForm();
        grantGenerator = new GrantGenerator();
        
        // Render dynamic content
        renderDynamicSections(labData);
        
        // Hydrate footer
        hydrateFooter();
        
        // Notify that everything is ready
        document.dispatchEvent(new CustomEvent('bioai-ready', { 
            detail: { labData, controllers: getControllers() } 
        }));
        
        console.log('BioAI Lab website initialized successfully');
        
    } catch (error) {
        console.error('Error initializing BioAI Lab website:', error);
    }
}

function getControllers() {
    return {
        componentManager,
        dataManager,
        animationController,
        darkModeController,
        searchController,
        heroKeywordRotator,
        heroStats,
        contactForm,
        grantGenerator
    };
}

function renderDynamicSections(data) {
    renderList(data.news, '[data-news-list]', createNewsCard);
    renderList(data.projects, '[data-projects-grid]', createProjectCard);
    // Team is now statically rendered in HTML
    renderList(data.testimonials, '[data-testimonials-grid]', createTestimonialCard);
    renderList(data.publications, '[data-publications-list]', createPublicationItem);
}

function renderList(items, selector, renderer) {
    const container = document.querySelector(selector);
    if (!container) {
        return;
    }
    container.innerHTML = '';
    container.setAttribute('data-stagger', 'true');
    
    if (!items || items.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'card-text empty-state';
        empty.textContent = 'Content coming soon.';
        container.appendChild(empty);
        if (animationController) {
            animationController.observeReveals(container);
        }
        return;
    }

    items.forEach(item => {
        const element = renderer(item);
        element.classList.add('reveal');
        container.appendChild(element);
    });

    if (animationController) {
        animationController.observeReveals(container);
    }
}

function createNewsCard(item) {
    const article = document.createElement('article');
    article.className = 'card-surface';
    const formattedDate = item.date ? new Date(item.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    }) : '';
    
    article.innerHTML = `
        <span class="soft-badge">News</span>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-text">${item.summary}</p>
        <div class="card-meta">${formattedDate}</div>
        ${item.image ? `<img src="${item.image}" alt="${item.title}" class="card-image" loading="lazy">` : ''}
    `;
    return article;
}

function createProjectCard(item) {
    const article = document.createElement('article');
    article.className = 'card-surface project-card';
    
    const statusClass = item.status?.toLowerCase().replace(/\s+/g, '-') || 'active';
    const statusText = item.status ?? 'Active';
    
    article.innerHTML = `
        <span class="project-status ${statusClass}">${statusText}</span>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-text">${item.summary}</p>
        ${item.image ? `<img src="${item.image}" alt="${item.title}" class="card-image" loading="lazy">` : ''}
        <div class="project-actions">
            <button class="pill-button secondary small" onclick="showProjectDetails('${item.title}')">
                Learn More
            </button>
        </div>
    `;
    return article;
}

function createTeamCard(member) {
    const article = document.createElement('article');
    const roleClass = member.role.toLowerCase().replace(/\s+/g, '-');
    
    // Set class based on role
    article.className = `team-card ${roleClass}-card`;
    
    // Add hero image
    const imageHtml = member.image ? 
        `<img src="${member.image}" alt="${member.name}" class="team-image" loading="lazy">` : 
        `<div class="team-avatar-placeholder">${member.name.split(' ').map(n => n[0]).join('')}</div>`;
    
    // Add contact links
    const contactLinks = [];
    if (member.email) contactLinks.push(`<a href="mailto:${member.email}" class="team-link email" aria-label="Email ${member.name}">✉️</a>`);
    if (member.website) contactLinks.push(`<a href="${member.website}" class="team-link website" target="_blank" rel="noopener" aria-label="${member.name}'s website">🌐</a>`);
    if (member.linkedin) contactLinks.push(`<a href="${member.linkedin}" class="team-link linkedin" target="_blank" rel="noopener" aria-label="${member.name}'s LinkedIn">💼</a>`);
    
    const linksHtml = contactLinks.length > 0 ? `<div class="team-links">${contactLinks.join('')}</div>` : '';
    
    article.innerHTML = imageHtml + linksHtml;
    
    return article;
}

function createTestimonialCard(testimonial) {
    const article = document.createElement('article');
    article.className = 'card-surface reveal';
    article.innerHTML = `
        <p class="testimonial-quote">“${testimonial.quote}”</p>
        <p class="testimonial-author">${testimonial.name}, ${testimonial.affiliation}</p>
    `;
    return article;
}

function createPublicationItem(publication) {
    const item = document.createElement('li');
    item.className = 'publication-item reveal';
    item.innerHTML = `
        <div class="publication-title">${publication.title}</div>
        <div class="publication-meta">${publication.authors} — <em>${publication.venue}</em>, ${publication.year}</div>
    `;
    return item;
}

function hydrateFooter() {
    const yearSpan = document.querySelector('footer [data-year]');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

// Enhanced utility functions for interactive components
window.showProjectDetails = function(projectTitle) {
    const projectData = window.__BIOAI_DATA__?.projects?.find(p => p.title === projectTitle);
    if (!projectData) {
        console.warn('Project not found:', projectTitle);
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'project-modal';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
        <div class="modal-content">
            <button class="modal-close" onclick="this.closest('.project-modal').remove()" aria-label="Close modal">&times;</button>
            <h2>${projectData.title}</h2>
            <span class="project-status">${projectData.status}</span>
            <p>${projectData.summary}</p>
            ${projectData.image ? `<img src="${projectData.image}" alt="${projectData.title}" class="modal-image">` : ''}
            <div class="modal-actions">
                <button class="pill-button" onclick="this.closest('.project-modal').remove()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};

// Model Selection Functions
window.selectModel = function(modelId) {
    // Remove selected class from all model cards
    document.querySelectorAll('.model-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selected class to the selected model
    const selectedCard = document.querySelector(`[data-model="${modelId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        document.getElementById('selected-model').value = modelId;
    }
};

window.toggleAdvancedOptions = function() {
    const advancedFields = document.getElementById('advanced-fields');
    const toggleButton = document.querySelector('.options-toggle');
    const optionsText = document.getElementById('options-text');
    const arrow = document.querySelector('.arrow');
    
    if (advancedFields.style.display === 'none') {
        advancedFields.style.display = 'grid';
        optionsText.textContent = 'Hide Advanced Options';
        arrow.classList.add('active');
    } else {
        advancedFields.style.display = 'none';
        optionsText.textContent = 'Show Advanced Options';
        arrow.classList.remove('active');
    }
};

// Grant Generator Functions with Different AI Models
window.generateProposal = async function() {
    const form = document.getElementById('grant-form');
    const model = document.getElementById('selected-model').value;
    
    if (!form.checkValidity()) {
        const invalidFields = form.querySelectorAll(':invalid');
        return;
    }
    
    // Clear previous errors
    document.querySelectorAll('.form-error').forEach(error => error.textContent = '');
    
    // Get form data
    const formData = {
        model,
        researchArea: document.getElementById('research-area').value,
        projectTitle: document.getElementById('project-title').value,
        projectDescription: document.getElementById('project-description').value,
        fundingAgency: document.getElementById('funding-agency').value,
        grantType: document.getElementById('grant-type').value,
        budget: document.getElementById('budget').value,
        duration: document.getElementById('duration').value,
        methodology: document.getElementById('methodology').value || '',
        expectedOutcomes: document.getElementById('expected-outcomes').value || '',
        collaborations: document.getElementById('collaborations').value || '',
        researchTitle: document.getElementById('project-title').value
    };
    
    // Show loading state
    const button = form.querySelector('.generate-button');
    const buttonText = button.querySelector('.button-text');
    const buttonLoading = button.querySelector('.button-loading');
    
    buttonText.style.display = 'none';
    buttonLoading.style.display = inline';
    startTime = Date.now();
    
    try {
        // Call appropriate AI based on selection
        let proposal;
        switch (formData.model) {
            case 'gpt4-research':
                proposal = await callOpenAI(formData);
                break;
            case 'claude-3':
                proposal = await callClaude(formData);
                break;
            case 'gemini-pro':
                proposal = await callGemini(formData);
                break;
            case 'llama-3':
                proposal = callLlama(formData);
                break;
            case 'mistral':
                proposal = callMistral(formData);
                break;
            default:
                proposal = await callOpenAI(formData);
        }
        
        // Update output panel
        displayProposal(proposal);
        
        // Update generation metrics
        const generationTime = Date.now() - startTime;
        const tokensUsed = estimateTokens(proposal);
        const qualityScore = calculateQualityScore(proposal);
        updateGenerationMetrics(generationTime, tokensUsed, qualityScore);
        
        document.getElementById('model-used').textContent = `Generated with ${getModelName(formData.model)`;
        
    } catch (error) {
        console.error('Error generating proposal:', error);
        alert('Error generating proposal. Please try again.');
    } finally {
        // Reset button state
        buttonText.style.display = 'inline';
        buttonLoading.style.display = 'none';
    }
};

// AI Model API Functions
async function callOpenAI(formData) {
    // Simulate OpenAI API call
    return await callAIModel(formData, 'OpenAI GPT-4', 'gpt-4-1106-preview', '/v1/chat/completions');
}

async function callClaude(formData) {
    // Simulate Claude API call
    return await callAIModel(formData, 'Claude 3 Sonnet', 'claude-3-sonnet', '/v1/messages');
}

async function callGemini(formData) {
    // Simulate Google Gemini API call
    return await callAIModel(formData, 'Gemini Pro', 'gemini-1.5-pro', '/v1/generate');
}

async function callLlama(formData) {
    // Simulate Meta Llama API call
    return await callAIModel(formData, 'Llama 3 70B', 'llama-3.1', '/v1/generate');
}

async function callMistral(formData) {
    // Simulate Mistral API call
    return await callAIModel(formData, 'Mistral Large', 'mistral-large', '/v1/chat/completions');
}

async function callAIModel(formData, modelName, modelId, endpoint) {
    // Simulate different AI model responses based on model selected
    const proposals = {
        'gpt4-research': generateGPT4Proposal(formData),
        'claude-3': generateClaudeProposal(formData),
        'gemini-pro': generateGeminiProposal(formData),
        'llama-3': generateLlamaProposal(formData),
        'mistral': generateMistralProposal(formData)
    };
    
    const proposal = proposals[formData.model] || proposals['gpt4-research'];
    return Promise.resolve(proposal);
}

function generateGPT4Proposal(formData) {
    const proposal = `# ${formData.researchTitle || 'Research Grant Proposal'}\n
**Principal Investigator:** ${getModelName('gpt4-research')}\n
**Funding Agency:** ${formatFundingAgency(formData.fundingAgency)}\n
**Grant Type:** ${formatGrantType(formData.grantType)}\n
**Amount:** ${formData.budget}\n\n## Executive Summary

${formData.projectDescription}\n\n## Research Objectives

This proposal leverages advanced ${formData.researchArea} methodologies to achieve significant breakthroughs in ${formData.technicalGoal || 'biological research'}. Our interdisciplinary approach combines ${formData.methodology || 'computational and experimental'} methods to address critical challenges in the field.

## Methodology

Our research integrates ${formData.methodology || 'state-of-the-art techniques'} with ${formData.experimental_approach || 'bench validation'} to ensure reproducibility and translational impact.

**Key Innovation:** ${formData.innovation || 'Novel computational approaches'} that establish new paradigms for ${formData.target_sector || 'biological system optimization'}.

## Expected Outcomes

${formData.expectedOutcomes || 'Substantial advancements in knowledge, publications, and technological capabilities'} within the proposal timeline.

## Budget & Timeline

**Budget:** ${formData.budget}\n**Duration:** ${formData.duration}\n**Peer Review:** Built into proposal development process

## Impact Measurement

We will use quantitative metrics to track proposal success through measurable indicators such as publication output, citation impact, and commercial applications.

*This proposal demonstrates excellence in scientific rigor and innovation potential.*`;
}

function generateClaudeProposal(formData) {
    const proposal = `# ${formData.researchTitle || 'Scientific Grant Proposal'}\n\n**Principal Investigator:** ${getModelName('claude-3')}\n
**Funding Agency:** ${formatFundingAgency(formData.fundingAgency)}\n
**Grant Type:** ${formatGrantType(formData.grantType)}\n
**Amount:** ${formData.budget}\n\n## Abstract

${formData.projectDescription}

## Research Background

The proposed research addresses critical needs in ${formData.researchArea} through ${formData.methodology || 'advanced computational frameworks'} that enable ${formData.target_sector || 'biological innovation'}.

## Technical Approach

Our methodology combines ${formData.methodology || 'cutting-edge techniques'} with ${formData.experimental_approach || 'rigorous validation'} protocols to ensure reproducibility.

## Innovation Highlights

- ${formData.innovation || 'Novel computational framework'}
- Interdisciplinary collaboration across ${formData.collaborations || 'multiple institutions'}
- Focus on ethical considerations and responsible AI development

## Implementation Strategy

The project will be executed over ${formData.duration} with clear milestones and deliverables established at each phase.

*This proposal demonstrates thoughtful planning and realistic scope management.*`;
}

function generateGeminiProposal(formData) {
    const proposal = `# ${formData.researchTitle || 'Medical Research Grant'}\n\n**Principal Investigator:** ${getModelName('gemini-pro')}\n
**Funding Agency:** ${formatFundingAgency(formData.fundingAgency)}\n
**Grant Type:** ${formatGrantType(formData.grantType)}\n
**Amount:** ${formData.budget}\n\n## Abstract

${formData.projectDescription}

## Research Significance

This project leverages Google Gemini Pro's access to recent medical literature and clinical databases to advance ${formData.researchArea} in ${formData.target_sector || 'medical biotechnology'} through ${formData.methodology || 'AI-driven approaches'}.

## Methodology

Our approach integrates ${formData.methodology || 'machine learning and simulation approaches'} with ${formData.experimental_approach || 'wet lab validation'} to achieve ${formData.expected_outcomes || 'clinical translation outcomes'}.

## Technical Innovation

- **AI-Powered Analysis**: Gemini Pro's multimodal capabilities for comprehensive literature review
- **Data-Driven Modeling**: Predictive analytics for ${formData.target_sector || 'biological systems'}
- **Real-Time Optimization**: Dynamic parameter adjustment based on intermediate results

## Expected Outcomes

${formData.expected_outcomes || 'Clinical translation and pipeline optimization'}`

## Timeline and Milestones

**Duration:** ${formData.duration}
**Budget:** ${formData.budget}
**Key Milestones:** Literature review, model development, validation testing, clinical translation.

*Increasing efficiency by 40% through AI-driven optimization*\n\nThis approach demonstrates how AI can accelerate biomedical research.*`;
}

function generateLlamaProposal(formData) {
    const proposal = `# ${formData.researchTitle || 'Computational Mathematics Grant'}\n
**Principal Investigator:** ${getModelName('llama-3')}\n
**Funding Agency:** ${formatFundingAgency(formData.fundingAgency)}\n
**Grant Type:** ${formatGrantType(formData.grantType)}\n
**Amount:** ${formData.budget}\n\n## Abstract

${formData.projectDescription}\n\n## Research Objectives

This grant supports fundamental advances in ${formData.researchArea} using ${formData.methodology || 'mathematical analysis'} applied to ${formData.target_sector || 'biological modeling'}.

## Methodology

Our approach employs ${formData.methodology || 'advanced mathematical frameworks'} to solve ${formData.challenges || 'complex computational problems'} with ${formData.experimental_approach || 'verification and validation'}.

## Novel Contributions

- **Algorithm Development**: ${formData.innovation || 'New mathematical frameworks'}
- **Open Source Release**: ${formData.opensource || 'All models and code developed will be open source'}
- **Educational Impact**: Training modules and tutorials for ${formData.education || 'community engagement'}

## Implementation Plans

**Phases:** ${formData.duration || '36 months'}\
**Deliverables:** ${formData.deliverables || 'Open-source models, publications, training materials'}

*Our solution combines cutting-edge mathematics with practical applications.*\n\n## Broader Impacts

*Publication Output:* Higher quality and faster computational methods
*Student Training:* Better mathematical literacy and tooling
*Commercial Value:* Increased efficiency in ${formData.target_sector || 'biological engineering'}

*Enables transformative research capabilities across academia and industry.*`;
}

function generateMistralProposal(formData) {
    const proposal = `# ${formData.researchTitle || 'International Research Grant'}\n
**Principal Investigator:** ${getModelName('mistral')}\n
**Funding Agency:** ${formatFundingAgency(formData.fundingAgency)}\n
**Grant Type:** ${formatGrantType(formData.grant_type)}\n
**Amount:** ${formData.budget}\n\n## Abstract

${formData.project_description}\n\n## Research Context

This proposal strengthens international collaborations in ${formData.research_area} by ${formData.methodology || 'advanced computational approaches'} that facilitate ${formData.collaborations || 'cross-institution partnerships'}.

## Technical Approach

Our ${formData.experimental_approach || 'hybrid computational-experimental'} methodology leverages ${formData.methodology || 'distributed computing'} to solve ${formData.challenges || 'distributed biological systems'} problems.

## Impact and Innovation

- **Collaboration Enhancement**: ${formData.collaborations || 'International partnerships'}
- **Open Science**: ${formData.opensource || 'All code and models shared globally'}
- **Multilingual Capabilities**: ${formData.multilingual || 'Multilingual support'} accessibility

## Expected Results

${formData.expected_outcomes || 'Improved collaboration efficiency and broader scientific reach'}'}

## Sustainability & Future Work

**Training & Dissemination:** ${formData.training || 'Educational programs'}\n**Continued Development:** Maintenance and optimization of ${models across grant period

*Fosters new collaborative networks and resource sharing*\n*Enables reproducible research at scale*\n\nThis proposal creates lasting value through open science and capacity building.*`;
}

function getModelName(modelId) {
    const models = {
        'gpt4-research': 'OpenAI GPT-4',
        'claude-3': 'Claude 3',
        'gemini-pro': 'Google Gemini Pro',
        'llama-3': 'Meta Llama 3',
        'mistral': 'Mistral Large'
    };
    return models[modelId] || 'OpenAI GPT-4';
}

function formatFundingAgency(agency) {
    const agencies = {
        'nsf': 'National Science Foundation (NSF)',
        'nih': 'National Institutes of Health (NIH)',
        'ukri': 'UK Research and Innovation (UKRI)',
        'eu': 'European Horizon Europe',
        'dod': 'Department of Defense (DoD)',
        'doe': 'Department of Energy (DOE)', 
        'industry': 'Industry Sponsor',
        'foundation': 'Private Foundation',
        'other': 'Other'
    };
    return agencies[agency] || agency;
}

function formatGrantType(type) {
    const types = {
        'seed': 'Seed Grant',
        'career': 'Career Development',
        'collaborative': 'Collaborative Research',
        'center': 'Research Center',
        'equipment': 'equipment Funding',
        'conference': 'Travel & Conference',
        'graduate': 'Graduate Fellowship',
        'postdoc': 'Postdoctoral Fellowship',
        'other': 'Other'
    };
    return types[type] || 'Seed Grant';
}

function estimateTokens(proposal) {
    // Simple token estimation based on text length
    const wordCount = proposal.split(/\s+/).length;
    return wordCount * 0.75; // Rough token estimate
}

function calculateQualityScore(proposal) {
    // Simple quality scoring based on content metrics
    const features = {
        'objective': proposal.includes('objectives') ? 20 : 0,
        'methodology': proposal.includes('methodology') || proposal.includes('approach') ? 20 : 0,
        'timeline': proposal.includes('timeline') ? 15 : 0,
        'budget': proposal.includes('budget') ? 10 : 0,
        'collaboration': proposal.includes('collaboration') ? 15 : 0,
        'references': proposal.includes('publication') ? 10 : 0,
        'qualitative': proposal.includes('quality') ? 10 : 0
    };
    
    return Math.min(95, Object.values(features).reduce((sum, score) => sum + score, 0));
}

function updateGenerationMetrics(time, tokens, score) {
    const metricsPanel = document.getElementById('generation-metrics');
    if (metricsPanel) {
        const stats = metricsPanel.querySelectorAll('.metric');
        stats[0].querySelector('.metric-value').textContent = `${time}s`;
        stats[1].querySelector('.metric-value').textContent = tokens;
        stats[2].querySelector('.metric-value').textContent = `${score}/100`;
        metricsPanel.style.display = 'block';
    }
}

function generateSampleProposal() {
    const content = `# Research Grant Proposal
    
## Executive Summary

This proposal requests $${document.getElementById('budget')?.value || '$250,000'} over ${duration || '2 years'} for ${fundingAgency || 'NSF'} to support groundbreaking research in AI research at our lab.

## Research Focus

We are developing ${researchArea || 'computational approaches'} tools and databases that solve real-world biological problems, from ${researchGoal || 'data analysis'} to ${researchImpact || 'industrial applications'}.

${methodology || 'Our methodology includes'} iterative testing and rigorous validation'}. ${collaborations || 'Working with partners'}.

## Expected Outcomes

- Publications in high-impact journals (${publications || '5-10 papers in target journals})
- Open-source software tools and databases for the research community
- Training materials and educational resources
- Enhanced research capabilities through collaborative networks

Impact: ${impact || 'Significant advancement in research capability'}.

## Budget Breakdown

**Personnel:** ${personnel || '60% of budget'}
**Equipment:** ${equipment || '15% of budget'}
**Travel/Dissemination:** ${travel || '10% of budget'}
**Overhead:** ${overhead || '5% of budget'}

${disciplinary_collaborations || 'Partners who bring expertise in complementary areas'}.

This is a community effort to advance ${technical_goal || 'AI and mathematics integration'} that benefits the entire scientific community.

**Professional quality, collaborative approach, and community focus position this project for success. Welcome opportunities for additional collaborators.${exclamation}`;
}

// Publications functionality
window.loadMorePublications = function() {
    // Implementation for loading more publications
    console.log('Loading more publications...');
};

// Form validation and submission
document.addEventListener('DOMContentLoaded', function() {
    // Character counter for forms
    const messageTextarea = document.getElementById('message');
    const messageCount = document.getElementById('message-count');
    const projectDescTextarea = document.getElementById('project-description');
    const charCount = document.getElementById('char-count');
    
    if (messageTextarea && messageCount) {
        messageTextarea.addEventListener('input', function() {
            const count = this.value.length;
            messageCount.textContent = count;
            if (count > 1000) {
                messageCount.style.color = '#dc3545';
            } else {
                messageCount.style.color = '';
            }
        });
    }
    
    if (projectDescTextarea && charCount) {
        projectDescTextarea.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count;
            if (count > 500) {
                charCount.style.color = '#dc3545';
            } else {
                charCount.style.color = '';
            }
        });
    }
    
    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous errors
            document.querySelectorAll('.form-error').forEach(error => error.textContent = '');
            
            // Simple validation
            let isValid = true;
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const subject = document.getElementById('subject');
            const message = document.getElementById('message');
            
            if (name && !name.value.trim()) {
                name.nextElementSibling.textContent = 'Name is required';
                isValid = false;
            }
            
            if (email && !email.value.trim()) {
                email.nextElementSibling.textContent = 'Email is required';
                isValid = false;
            } else if (email && !isValidEmail(email.value)) {
                email.nextElementSibling.textContent = 'Please enter a valid email';
                isValid = false;
            }
            
            if (subject && !subject.value) {
                subject.nextElementSibling.textContent = 'Please select a subject';
                isValid = false;
            }
            
            if (message && !message.value.trim()) {
                message.nextElementSibling.textContent = 'Message is required';
                isValid = false;
            }
            
            if (isValid) {
                // Show success message
                const formMessage = document.getElementById('form-message');
                if (formMessage) {
                    formMessage.textContent = 'Thank you for your message! We\'ll get back to you soon.';
                    formMessage.className = 'form-message success';
                    formMessage.style.display = 'block';
                }
                contactForm.reset();
            }
        });
    }
    
    // Grant form submission
    const grantForm = document.getElementById('grant-form');
    if (grantForm) {
        grantForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            const button = this.querySelector('.generate-button');
            const buttonText = button.querySelector('.button-text');
            const buttonLoading = button.querySelector('.button-loading');
            
            buttonText.style.display = 'none';
            buttonLoading.style.display = 'inline';
            
            // Simulate AI generation
            setTimeout(() => {
                const outputPanel = document.getElementById('grant-output');
                const proposalContent = document.getElementById('proposal-content');
                
                if (outputPanel && proposalContent) {
                    // Generate sample proposal
                    const proposal = generateSampleProposal();
                    proposalContent.innerHTML = `<div class="proposal-text">${proposal}</div>`;
                    outputPanel.style.display = 'block';
                    
                    // Scroll to output
                    outputPanel.scrollIntoView({ behavior: 'smooth' });
                }
                
                // Reset button state
                buttonText.style.display = 'inline';
                buttonLoading.style.display = 'none';
            }, 2000);
        });
    }
    
    // Year filter for publications
    const yearSelect = document.getElementById('pub-year');
    if (yearSelect) {
        yearSelect.addEventListener('change', function() {
            const year = this.value;
            filterPublications(year);
        });
    }
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function generateSampleProposal() {
    return `# Research Grant Proposal

## Executive Summary
This proposal outlines a comprehensive research program focused on advancing the integration of artificial intelligence with biological systems to address critical challenges in biotechnology and medicine.

## Research Objectives
1. Develop novel machine learning algorithms for biological data analysis
2. Create predictive models for metabolic pathway optimization
3. Establish computational frameworks for drug discovery

## Methodology
Our approach combines deep learning, constraint-based modeling, and experimental validation to achieve breakthrough results in biological engineering.

## Expected Outcomes
- Publication of 5-7 high-impact papers annually
- Development of novel computational tools for the research community
- Training of next-generation scientists in bioinformatics

## Timeline
Phase 1 (Year 1): Algorithm development and validation
Phase 2 (Year 2): Application to specific biological problems
Phase 3 (Year 3): Optimization and dissemination

## Budget
$500,000 annually for personnel, computational resources, and experimental validation.

This project has the potential to transform how we approach biological research and deliver significant benefits to society.`;
}

function filterPublications(year) {
    const publications = document.querySelectorAll('.publication-item');
    let count = 0;
    
    publications.forEach(pub => {
        if (year === 'all') {
            pub.style.display = 'flex';
            count++;
        } else {
            const pubYear = pub.querySelector('.publication-year');
            if (pubYear && pubYear.textContent.includes(year)) {
                pub.style.display = 'flex';
                count++;
            } else {
                pub.style.display = 'none';
            }
        }
    });
    
    // Update count
    const countDisplay = document.getElementById('pub-count');
    if (countDisplay) {
        countDisplay.textContent = count;
    }
}

// Smooth scroll for navigation links
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the app
    bootstrap();
    
    // Set up smooth scrolling for navigation links
    setupSmoothScrolling();
});

function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                const headerOffset = 100; // Account for fixed header height
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Update active nav link
                // Update active nav link
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
    
    // Update active nav link on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section[id]');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120; // More offset for better detection
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href').slice(1) === current);
        });
    });
}
