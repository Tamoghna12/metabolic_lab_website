/**
 * Component Manager - Handles dynamic component loading and rendering
 */
export class ComponentManager {
    constructor() {
        this.componentOrder = [
            'header',
            'hero', 
            'research-card',
            'team-card',
            'publications-with-filter',
            'partners',
            'grant-generator-ai',
            'contact-form',
            'footer'
        ];
        this.loadedComponents = new Map();
    }

    async loadAllComponents() {
        const app = document.getElementById('app');
        if (!app) {
            console.error('App container not found');
            return;
        }

        const fragment = document.createDocumentFragment();

        for (const name of this.componentOrder) {
            const section = await this.loadComponent(name);
            if (section) {
                fragment.appendChild(section);
                this.loadedComponents.set(name, section);
            }
        }

        app.appendChild(fragment);
        return this.loadedComponents;
    }

    async loadComponent(name) {
        try {
            const response = await fetch(`components/${name}.html`);
            if (!response.ok) {
                console.warn(`Component ${name} not found`);
                return null;
            }
            
            const html = await response.text();
            const wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            return wrapper.firstElementChild;
        } catch (error) {
            console.error(`Error loading component ${name}:`, error);
            return null;
        }
    }

    getComponent(name) {
        return this.loadedComponents.get(name);
    }
}
