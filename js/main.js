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

// Grant Generator functionality
window.copyProposal = function() {
    const content = document.getElementById('proposal-content');
    if (content) {
        navigator.clipboard.writeText(content.innerText).then(() => {
            alert('Proposal copied to clipboard!');
        });
    }
};

window.downloadProposal = function() {
    const content = document.getElementById('proposal-content');
    if (content) {
        const blob = new Blob([content.innerText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'grant-proposal.txt';
        a.click();
        window.URL.revokeObjectURL(url);
    }
};

window.editProposal = function() {
    const content = document.getElementById('proposal-content');
    if (content) {
        content.contentEditable = true;
        content.focus();
    }
};

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
