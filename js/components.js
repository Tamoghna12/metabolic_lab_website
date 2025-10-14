import { cacheBust } from './utils.js';

const componentCache = new Map();

export async function loadComponent(name) {
    if (componentCache.has(name)) {
        return componentCache.get(name).cloneNode(true);
    }

    try {
        const response = await fetch(`components/${name}.html${cacheBust()}`);
        if (!response.ok) {
            throw new Error(`Failed to load component: ${name}`);
        }

        const html = await response.text();
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        const content = template.content.firstElementChild || template.content;

        componentCache.set(name, content.cloneNode(true));
        return content;
    } catch (error) {
        console.error(error);
        return null;
    }
}
