/**
 * Dark Mode Controller - Manages theme switching with localStorage persistence
 */
export class DarkModeController {
    constructor() {
        this.toggle = null;
        this.theme = 'light';
        this.init();
    }

    init() {
        this.setupTheme();
        this.findToggleButton();
        this.registerEventListeners();
    }

    setupTheme() {
        // Check localStorage first
        const savedTheme = localStorage.getItem('bioai-theme');
        if (savedTheme) {
            this.theme = savedTheme;
        } else {
            // Check system preference
            this.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        this.applyTheme();
    }

    findToggleButton() {
        this.toggle = document.querySelector('[data-dark-mode-toggle]');
    }

    registerEventListeners() {
        if (!this.toggle) return;

        this.toggle.addEventListener('change', () => {
            this.theme = this.toggle.checked ? 'dark' : 'light';
            this.applyTheme();
            localStorage.setItem('bioai-theme', this.theme);
        });

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('bioai-theme')) {
                this.theme = e.matches ? 'dark' : 'light';
                this.applyTheme();
                if (this.toggle) {
                    this.toggle.checked = this.theme === 'dark';
                }
            }
        });
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        
        if (this.toggle) {
            this.toggle.checked = this.theme === 'dark';
        }

        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.content = this.theme === 'dark' ? '#1a1a1a' : '#ffffff';
        }

        // Dispatch custom event for other components
        document.dispatchEvent(new CustomEvent('theme-changed', { 
            detail: { theme: this.theme } 
        }));
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('bioai-theme', this.theme);
        if (this.toggle) {
            this.toggle.checked = this.theme === 'dark';
        }
    }

    getCurrentTheme() {
        return this.theme;
    }
}
