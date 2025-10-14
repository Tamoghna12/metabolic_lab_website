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
    renderList(data.team, '[data-team-grid]', createTeamCard);
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
    article.className = 'card-surface reveal team-card';
    article.innerHTML = `
        <h3 class="team-name">${member.name}</h3>
        <div class="team-role">${member.role}</div>
        <p class="team-bio">${member.bio}</p>
    `;
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

// Global utility function for project details
window.showProjectDetails = function(projectTitle) {
    // Find project data
    const projectData = window.__BIOAI_DATA__?.projects?.find(p => p.title === projectTitle);
    if (!projectData) {
        console.warn('Project not found:', projectTitle);
        return;
    }

    // Create and show modal
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
