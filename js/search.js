import { debounce } from './utils.js';

export function initializeSearch() {
    const input = document.querySelector('[data-search-input]');
    if (!input) {
        return;
    }

    const resultsContainer = document.querySelector('[data-search-results]');

    const handleSearch = debounce((event) => {
        const query = event.target.value.trim().toLowerCase();
        const data = window.__BIOAI_DATA__;

        if (!resultsContainer || !data) {
            return;
        }

        resultsContainer.innerHTML = '';

        if (!query) {
            resultsContainer.dataset.state = 'idle';
            return;
        }

        const matches = [
            ...data.projects
                .filter((item) => item.title.toLowerCase().includes(query))
                .map((item) => ({ ...item, __type: 'Project' })),
            ...data.publications
                .filter((item) => item.title.toLowerCase().includes(query))
                .map((item) => ({ ...item, __type: 'Publication' })),
            ...data.news
                .filter((item) => item.title.toLowerCase().includes(query))
                .map((item) => ({ ...item, __type: 'News' }))
        ].slice(0, 5);

        if (matches.length === 0) {
            resultsContainer.dataset.state = 'empty';
            resultsContainer.textContent = 'No results found.';
            return;
        }

        resultsContainer.dataset.state = 'results';
        for (const match of matches) {
            const article = document.createElement('article');
            article.className = 'search-result-card';
            article.innerHTML = `
                <div class="soft-badge">${match.__type}</div>
                <h4 class="card-title" style="margin: 0.75rem 0 0.35rem;">${match.title}</h4>
                <p class="card-text">${match.summary || match.description || ''}</p>
            `;
            resultsContainer.appendChild(article);
        }
    }, 250);

    input.addEventListener('input', handleSearch);
}
