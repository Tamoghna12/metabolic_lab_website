import { fetchJson } from './utils.js';

export async function fetchLabData() {
    const [publications, team, news, projects, testimonials] = await Promise.all([
        fetchJson('data/publications.json'),
        fetchJson('data/team-members.json'),
        fetchJson('data/news.json'),
        fetchJson('data/projects.json'),
        fetchJson('data/testimonials.json')
    ]);

    return { publications, team, news, projects, testimonials };
}
