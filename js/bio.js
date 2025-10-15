/**
 * Bio Page Interactions - Handles team member bio page functionality
 */
class BioPageManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupBioLinkInteractions();
        this.setupSmoothTransitions();
        this.setupScrollAnimations();
        this.setupKeyboardNavigation();
        this.setupLoadingAnimations();
    }

    setupBioLinkInteractions() {
        // Add click handlers for bio links on main page
        const bioLinks = document.querySelectorAll('.bio-link');
        
        bioLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.endsWith('.html')) {
                    // Add loading state
                    this.addLoadingState(link);
                    
                    // Track navigation
                    this.trackBioNavigation(href);
                }
            });
        });
    }

    setupSmoothTransitions() {
        // Add page transition animations
        const bioPage = document.querySelector('.bio-page');
        if (!bioPage) return;

        // Initial fade-in animation
        bioPage.style.opacity = '0';
        bioPage.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            bioPage.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            bioPage.style.opacity = '1';
            bioPage.style.transform = 'translateY(0)';
        }, 100);

        // Setup smooth scroll for internal navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(e.currentTarget.getAttribute('href'));
                if (target) {
                    this.smoothScrollTo(target);
                }
            });
        });

        // Animate elements on scroll
        this.setupScrollAnimations();
    }

    setupScrollAnimations() {
        const animateElements = document.querySelectorAll('.qualification-item, .research-focus-item, .achievement-item, .project-card');
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px',
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                }
            });
        }, observerOptions);

        animateElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(element);
        });
    }

    setupKeyboardNavigation() {
        // Add keyboard navigation for better UX
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Go back to main page if on bio page
                const backButton = document.querySelector('.back-button');
                if (backButton) {
                    backButton.click();
                }
            }
        });
    }

    setupLoadingAnimations() {
        // Add loading animations for bio cards on hover
        const bioCards = document.querySelectorAll('.research-focus-item, .achievement-item, .project-card');
        
        bioCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'scale(1.02)';
                card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'scale(1)';
                card.style.boxShadow = 'none';
            });
        });

        // Animate skill tags
        const skillTags = document.querySelectorAll('.skill-tag');
        skillTags.forEach((tag, index) => {
            tag.style.animationDelay = `${index * 50}ms`;
            tag.style.animation = 'fadeInUp 0.5s ease forwards';
        });
    }

    addLoadingState(link) {
        const originalText = link.textContent;
        link.innerHTML = '<span class="loading-spinner"></span> Loading...';
        link.style.opacity = '0.7';

        // Remove loading state after navigation
        setTimeout(() => {
            link.textContent = originalText;
            link.style.opacity = '1';
        }, 2000);
    }

    smoothScrollTo(target) {
        const headerOffset = 100;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    trackBioNavigation(href) {
        // Track bio navigation for analytics (optional)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'bio_view', {
                'page_title': href.replace('.html', ''),
                'page_location': window.location.href
            });
        }
        
        console.log(`Navigating to bio: ${href}`);
    }

    // Utility method to create smooth page transitions
    createPageTransition(targetUrl) {
        return new Promise((resolve) => {
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                window.location.href = targetUrl;
                resolve();
            }, 300);
        });
    }

    // Method to enhance image loading
    enhanceImageLoading() {
        const images = document.querySelectorAll('.bio-photo img');
        
        images.forEach(img => {
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });
            
            img.addEventListener('error', () => {
                img.src = 'https://via.placeholder.com/400x400/6366f1/ffffff?text=Profile';
            });
        });
    }

    // Method to add interactive timeline effects
    setupTimelineEffects() {
        const timelineItems = document.querySelectorAll('.qualification-item, .achievement-item');
        
        timelineItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.style.animation = 'slideInLeft 0.6s ease forwards';
        });
    }

    // Method to add contact form interactions
    setupContactInteractions() {
        const contactItems = document.querySelectorAll('.contact-item');
        
        contactItems.forEach(item => {
            item.addEventListener('click', () => {
                const link = item.querySelector('a');
                if (link) {
                    link.click();
                }
            });

            item.addEventListener('mouseenter', () => {
                item.style.cursor = 'pointer';
            });
        });
    }
}

// Initialize bio page functionality
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a bio page
    if (document.querySelector('.bio-page')) {
        const bioManager = new BioPageManager();
        
        // Enhance image loading
        bioManager.enhanceImageLoading();
        
        // Setup timeline effects
        bioManager.setupTimelineEffects();
        
        // Setup contact interactions
        bioManager.setupContactInteractions();
        
        // Add smooth back navigation
        const backButton = document.querySelector('.back-button');
        if (backButton) {
            backButton.addEventListener('click', (e) => {
                e.preventDefault();
                const targetUrl = backButton.getAttribute('href');
                bioManager.createPageTransition(targetUrl);
            });
        }
    }

    // Setup bio link interactions on main page
    if (!document.querySelector('.bio-page')) {
        const bioManager = new BioPageManager();
    }
});

// Export for other scripts
window.BioPageManager = BioPageManager;
