import { useState, useEffect } from 'preact/hooks';
import { Sun, Moon } from 'lucide-preact';

export default function DarkModeToggle() {
    const [theme, setTheme] = useState('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem('bioai-theme');
        if (stored && (stored === 'dark' || stored === 'light')) {
            setTheme(stored);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        } else {
            setTheme('light');
        }

        // Listen for system theme changes (only when user hasn't explicitly set a preference)
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            if (!localStorage.getItem('bioai-theme')) {
                const newTheme = e.matches ? 'dark' : 'light';
                setTheme(newTheme);
                if (newTheme === 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                    document.documentElement.removeAttribute('data-theme');
                }
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const applyTheme = (newTheme) => {
        setTheme(newTheme);
        if (newTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('bioai-theme', newTheme);
        applyTheme(newTheme);
    };

    // Prevent hydration mismatch by rendering a placeholder until mounted
    if (!mounted) {
        return <div class="w-9 h-9" />;
    }

    return (
        <button
            onClick={toggleTheme}
            class="theme-toggle-btn relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-alt transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`${theme === 'light' ? 'Dark' : 'Light'} mode`}
        >
            {theme === 'light' ? (
                <Moon size={18} class="text-text-secondary hover:text-primary transition-colors" />
            ) : (
                <Sun size={18} class="text-accent hover:text-yellow-400 transition-colors" />
            )}
        </button>
    );
}
