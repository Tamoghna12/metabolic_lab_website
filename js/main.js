import { loadComponent } from './components.js';
import { registerDarkModeToggle } from './dark-mode.js';
import { initializeSearch } from './search.js';
import { fetchLabData } from './api-integration.js';

const componentOrder = [
    'header',
    'hero',
    'overview',
    'research',
    'news',
    'projects',
    'publications',
    'team',
    'testimonials',
    'grant-generator',
    'contact',
    'footer'
];

let revealObserver;

async function bootstrap() {
    const app = document.getElementById('app');
    if (!app) {
        console.error('App container not found');
        return;
    }

    const fragment = document.createDocumentFragment();

    for (const name of componentOrder) {
        const section = await loadComponent(name);
        if (section) {
            fragment.appendChild(section);
        }
    }

    app.appendChild(fragment);

    registerDarkModeToggle();
    registerRevealAnimations();
    registerHeroKeywordRotation();
    initializeSearch();
    hydrateFooter();
    registerGrantGenerator();

    const data = await fetchLabData();
    window.__BIOAI_DATA__ = data;
    renderDynamicSections(data);
    document.dispatchEvent(new CustomEvent('bioai-data-ready', { detail: data }));
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
    if (!items || items.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'card-text';
        empty.textContent = 'Content coming soon.';
        container.appendChild(empty);
        observeReveals(container);
        return;
    }

    for (const item of items) {
        container.appendChild(renderer(item));
    }

    observeReveals(container);
}

function createNewsCard(item) {
    const article = document.createElement('article');
    article.className = 'card-surface reveal';
    const formattedDate = item.date ? new Date(item.date).toLocaleDateString() : '';
    article.innerHTML = `
        <span class="soft-badge">News</span>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-text">${item.summary}</p>
        <div class="card-meta">${formattedDate}</div>
    `;
    return article;
}

function createProjectCard(item) {
    const article = document.createElement('article');
    article.className = 'card-surface reveal';
    article.innerHTML = `
        <span class="project-status">${item.status ?? 'In progress'}</span>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-text">${item.summary}</p>
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

function registerGrantGenerator() {
    const form = document.querySelector('[data-grant-form]');
    const output = document.querySelector('[data-grant-output]');
    const text = document.querySelector('[data-grant-text]');

    if (!form || !output || !text) {
        return;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const focus = formData.get('focus');
        const impact = formData.get('impact');
        const context = formData.get('context');

        const sentences = [
            `We propose to investigate ${focus}, leveraging BioAI Lab expertise to deliver ${impact}.`
        ];

        if (context) {
            sentences.push(`By partnering with ${context}, we will amplify translational impact.`);
        }

        sentences.push('Our multidisciplinary platform will accelerate translation from concept to measurable outcomes.');
        text.textContent = sentences.join(' ');
        output.hidden = false;
        observeReveals(output.parentElement || document);
    });
}

function registerRevealAnimations() {
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.reveal').forEach((element) => {
            element.classList.add('is-visible');
        });
        return;
    }

    revealObserver = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            }
        },
        {
            threshold: 0.15,
            rootMargin: '0px 0px -60px 0px'
        }
    );

    observeReveals(document);
}

function observeReveals(root = document) {
    if (!revealObserver) {
        root.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
        return;
    }

    root.querySelectorAll('.reveal').forEach((element) => {
        if (!element.classList.contains('is-visible')) {
            revealObserver.observe(element);
        }
    });
}

function registerHeroKeywordRotation() {
    const wrapper = document.querySelector('[data-hero-keywords]');
    if (!wrapper) {
        return;
    }

    const keywords = (wrapper.dataset.heroKeywords || '')
        .split('|')
        .map((keyword) => keyword.trim())
        .filter(Boolean);
    const display = wrapper.querySelector('[data-hero-keyword]');

    if (!display || keywords.length === 0) {
        return;
    }

    let index = 0;
    display.textContent = keywords[index];

    if (keywords.length === 1) {
        return;
    }

    setInterval(() => {
        index = (index + 1) % keywords.length;
        wrapper.classList.add('is-changing');
        setTimeout(() => {
            display.textContent = keywords[index];
            wrapper.classList.remove('is-changing');
        }, 200);
    }, 2800);
}

window.addEventListener('DOMContentLoaded', bootstrap);
