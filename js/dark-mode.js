const STORAGE_KEY = 'bioai-theme';

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const stylesheet = document.getElementById('dark-mode-stylesheet');
    if (stylesheet) {
        stylesheet.disabled = theme !== 'dark';
    }
}

function getSystemPreference() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function registerDarkModeToggle() {
    const toggle = document.querySelector('[data-dark-mode-toggle]');
    const savedTheme = localStorage.getItem(STORAGE_KEY) || getSystemPreference();
    applyTheme(savedTheme);

    if (!toggle) {
        return;
    }

    toggle.checked = savedTheme === 'dark';

    toggle.addEventListener('change', () => {
        const theme = toggle.checked ? 'dark' : 'light';
        localStorage.setItem(STORAGE_KEY, theme);
        applyTheme(theme);
    });
}
