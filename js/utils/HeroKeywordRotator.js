/**
 * Hero Keyword Rotator - Enhanced with smooth transitions and accessibility
 */
export class HeroKeywordRotator {
    constructor() {
        this.wrapper = null;
        this.display = null;
        this.keywords = [];
        this.currentIndex = 0;
        this.interval = null;
        this.init();
    }

    init() {
        this.findElements();
        this.extractKeywords();
        this.startRotation();
    }

    findElements() {
        this.wrapper = document.querySelector('[data-hero-keywords]');
        this.display = document.querySelector('[data-hero-keyword]');
    }

    extractKeywords() {
        if (!this.wrapper) return;

        const keywordsText = this.wrapper.dataset.heroKeywords || '';
        this.keywords = keywordsText
            .split('|')
            .map(keyword => keyword.trim())
            .filter(Boolean);

        // Set initial keyword
        if (this.display && this.keywords.length > 0) {
            this.display.textContent = this.keywords[0];
        }
    }

    startRotation() {
        if (!this.wrapper || !this.display || this.keywords.length <= 1) {
            return;
        }

        this.interval = setInterval(() => {
            this.rotateKeyword();
        }, 3200);
    }

    rotateKeyword() {
        this.currentIndex = (this.currentIndex + 1) % this.keywords.length;
        
        // Add transition class
        this.wrapper.classList.add('is-changing');
        
        // Change text after fade out starts
        setTimeout(() => {
            this.display.textContent = this.keywords[this.currentIndex];
            
            // Remove transition class after fade in
            setTimeout(() => {
                this.wrapper.classList.remove('is-changing');
            }, 200);
        }, 150);
    }

    pause() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    resume() {
        if (this.interval) return;
        this.startRotation();
    }

    destroy() {
        this.pause();
        this.wrapper = null;
        this.display = null;
        this.keywords = [];
    }
}
