/**
 * Animation Controller - Manages scroll animations, transitions, and micro-interactions
 */
export class AnimationController {
    constructor() {
        this.revealObserver = null;
        this.init();
    }

    init() {
        this.setupRevealAnimations();
        this.setupHoverEffects();
        this.setupMicroInteractions();
    }

    setupRevealAnimations() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for browsers without IntersectionObserver
            document.querySelectorAll('.reveal').forEach(element => {
                element.classList.add('is-visible');
            });
            return;
        }

        this.revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        
                        // Add stagger effect for lists
                        const parentList = entry.target.closest('[data-stagger]');
                        if (parentList) {
                            const siblings = Array.from(parentList.children);
                            const index = siblings.indexOf(entry.target);
                            entry.target.style.animationDelay = `${index * 100}ms`;
                        }
                        
                        this.revealObserver.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.15,
                rootMargin: '0px 0px -60px 0px'
            }
        );

        this.observeReveals();
    }

    observeReveals(root = document) {
        if (!this.revealObserver) {
            root.querySelectorAll('.reveal').forEach(element => {
                element.classList.add('is-visible');
            });
            return;
        }

        root.querySelectorAll('.reveal').forEach(element => {
            if (!element.classList.contains('is-visible')) {
                this.revealObserver.observe(element);
            }
        });
    }

    setupHoverEffects() {
        // Enhanced hover effects for cards
        document.addEventListener('mouseover', (e) => {
            const card = e.target.closest('.card-surface, .team-card, .publication-item');
            if (card) {
                card.classList.add('hovered');
            }
        });

        document.addEventListener('mouseout', (e) => {
            const card = e.target.closest('.card-surface, .team-card, .publication-item');
            if (card) {
                card.classList.remove('hovered');
            }
        });

        // Smooth scale effect for buttons
        document.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('pill-button')) {
                e.target.style.transform = 'translateY(-2px) scale(1.02)';
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('pill-button')) {
                e.target.style.transform = '';
            }
        });
    }

    setupMicroInteractions() {
        // Ripple effect for buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('pill-button')) {
                this.createRipple(e);
            }
        });

        // Parallax effect for hero section
        this.setupParallax();
    }

    createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = event.clientX - rect.left - size / 2 + 'px';
        ripple.style.top = event.clientY - rect.top - size / 2 + 'px';
        ripple.classList.add('ripple');

        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    setupParallax() {
        const heroSection = document.querySelector('.hero');
        if (!heroSection) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = heroSection.querySelectorAll('[data-parallax]');
            
            parallaxElements.forEach(element => {
                const speed = parseFloat(element.dataset.parallax) || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = this.formatNumber(target);
                clearInterval(timer);
            } else {
                element.textContent = this.formatNumber(Math.floor(current));
            }
        }, 16);
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
}
