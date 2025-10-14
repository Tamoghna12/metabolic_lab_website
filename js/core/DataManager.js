/**
 * Data Manager - Handles fetching and managing lab data
 */
export class DataManager {
    constructor() {
        this.data = null;
        this.cache = new Map();
    }

    async fetchLabData() {
        if (this.data) {
            return this.data;
        }

        try {
            const [news, projects, publications, team, testimonials] = await Promise.all([
                this.fetchJson('data/news.json'),
                this.fetchJson('data/projects.json'),
                this.fetchJson('data/publications.json'),
                this.fetchJson('data/team-members.json'),
                this.fetchJson('data/testimonials.json')
            ]);

            this.data = {
                news,
                projects,
                publications,
                team,
                testimonials
            };

            window.__BIOAI_DATA__ = this.data;
            return this.data;
        } catch (error) {
            console.error('Error fetching lab data:', error);
            return {};
        }
    }

    async fetchJson(url) {
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`Failed to fetch ${url}`);
                return [];
            }
            const data = await response.json();
            this.cache.set(url, data);
            return data;
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
            return [];
        }
    }

    getData() {
        return this.data;
    }
}
