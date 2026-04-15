export function debounce(fn, delay = 200) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

export async function fetchJson(path) {
    const response = await fetch(`${path}${cacheBust()}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${path}`);
    }
    return response.json();
}

export function cacheBust() {
    return `?v=${document.lastModified}`;
}
