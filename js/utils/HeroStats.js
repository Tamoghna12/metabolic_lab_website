/**
 * Hero Stats - Animated statistics counter with smooth number progression
 */
export class HeroStats {
    constructor(animationController) {
        this.animationController = animationController;
        this.stats = [];
        this.hasAnimated = false;
        this.init();
    }

    init() {
        this.findStats();
        this.setupIntersectionObserver();
    }

    findStats() {
        const statElements = document.querySelectorAll('.hero-metric .stat-number');
        
        statElements.forEach(element => {
            const text = element.textContent.trim();
            const match = text.match(/[\d.]+/);
            
            if (match) {
                const value = parseFloat(match[0]);
                const suffix = text.replace(match[0], '').trim();
                
                this.stats.push({
                    element,
                    value: this.parseValue(text),
                    suffix,
                    originalText: text
                });
            }
        });
    }

    parseValue(text) {
        // Convert text like "£1.2M" or "42" to a number
        const match = text.match(/[\d.]+/);
        if (!match) return 0;

        const number = parseFloat(match[0]);
        
        if (text.includes('M')) return number * 1000000;
        if (text.includes('K')) return number * 1000;
        if (text.includes('£')) return number * 1000000; // Convert £1.2M to 1.2M for display
        
        return number;
    }

    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window) || this.stats.length === 0) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.hasAnimated) {
                        this.animateStats();
                        this.hasAnimated = true;
                        observer.disconnect();
                    }
                });
            },
            {
                threshold: 0.5
            }
        );

        const heroMetrics = document.querySelector('.hero-metrics');
        if (heroMetrics) {
            observer.observe(heroMetrics);
        }
    }

    animateStats() {
        this.stats.forEach((stat, index) => {
            setTimeout(() => {
                this.animationController.animateCounter(
                    stat.element,
                    stat.value,
                    2000
                );
                
                // Add suffix back after animation
                setTimeout(() => {
                    const currentValue = stat.element.textContent;
                    stat.element.textContent = currentValue + (stat.suffix ? ` ${stat.suffix}` : '');
                }, 2000);
            }, index * 200);
        });
    }

    reset() {
        this.hasAnimated = false;
        this.stats.forEach(stat => {
            stat.element.textContent = stat.originalText;
        });
    }
}
