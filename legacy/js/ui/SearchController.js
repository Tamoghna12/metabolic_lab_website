/**
 * Search Controller - Enhanced search with autocomplete and real-time results
 */
export class SearchController {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.searchInput = null;
        this.searchResults = null;
        this.currentIndex = -1;
        this.searchData = [];
        this.init();
    }

    init() {
        this.findSearchElements();
        this.setupEventListeners();
        this.loadSearchData();
    }

    findSearchElements() {
        this.searchInput = document.querySelector('[data-search-input]');
        this.searchResults = document.querySelector('[data-search-results]');
    }

    setupEventListeners() {
        if (!this.searchInput) return;

        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            this.performSearch(query);
        });

        this.searchInput.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Close results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.hero-search-card')) {
                this.hideResults();
            }
        });
    }

    async loadSearchData() {
        const data = await this.dataManager.fetchLabData();
        this.searchData = [
            ...(data.news || []).map(item => ({ ...item, type: 'news' })),
            ...(data.projects || []).map(item => ({ ...item, type: 'project' })),
            ...(data.publications || []).map(item => ({ ...item, type: 'publication' })),
            ...(data.team || []).map(item => ({ ...item, type: 'team' }))
        ];
    }

    performSearch(query) {
        if (!query) {
            this.hideResults();
            return;
        }

        const results = this.searchData.filter(item => {
            const searchFields = [
                item.title,
                item.summary,
                item.authors,
                item.name,
                item.bio,
                item.role
            ].filter(Boolean);

            return searchFields.some(field => 
                field.toLowerCase().includes(query.toLowerCase())
            );
        });

        this.displayResults(results, query);
    }

    displayResults(results, query) {
        if (!this.searchResults) return;

        this.searchResults.setAttribute('data-state', 'loading');

        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-empty-state">
                    <p>No results found for "<strong>${this.escapeHtml(query)}</strong>"</p>
                    <small>Try searching for projects, publications, or team members</small>
                </div>
            `;
            this.searchResults.setAttribute('data-state', 'empty');
            return;
        }

        const html = results.slice(0, 8).map((result, index) => 
            this.createResultItem(result, query, index)
        ).join('');

        this.searchResults.innerHTML = html;
        this.searchResults.setAttribute('data-state', 'results');
        this.currentIndex = -1;
    }

    createResultItem(result, query, index) {
        const typeIcons = {
            news: '📰',
            project: '🔬',
            publication: '📄',
            team: '👥'
        };

        const highlightedTitle = this.highlightMatch(result.title || result.name, query);
        const highlightedSummary = this.highlightMatch(result.summary || result.bio, query);

        return `
            <div class="search-result-item" data-index="${index}" data-type="${result.type}">
                <div class="search-result-icon">${typeIcons[result.type] || '📄'}</div>
                <div class="search-result-content">
                    <h4>${highlightedTitle}</h4>
                    <p>${highlightedSummary}</p>
                    <span class="search-result-type">${result.type}</span>
                </div>
            </div>
        `;
    }

    highlightMatch(text, query) {
        if (!text) return '';
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    handleKeyboardNavigation(e) {
        const items = this.searchResults.querySelectorAll('.search-result-item');
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.currentIndex = Math.min(this.currentIndex + 1, items.length - 1);
                this.updateActiveItem(items);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.currentIndex = Math.max(this.currentIndex - 1, -1);
                this.updateActiveItem(items);
                break;
            case 'Enter':
                e.preventDefault();
                if (this.currentIndex >= 0 && items[this.currentIndex]) {
                    items[this.currentIndex].click();
                }
                break;
            case 'Escape':
                this.hideResults();
                this.searchInput.blur();
                break;
        }
    }

    updateActiveItem(items) {
        items.forEach((item, index) => {
            item.classList.toggle('active', index === this.currentIndex);
        });
    }

    hideResults() {
        if (this.searchResults) {
            this.searchResults.innerHTML = '';
            this.searchResults.setAttribute('data-state', 'idle');
        }
        this.currentIndex = -1;
    }
}
