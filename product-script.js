// Enhanced interactivity for TidBit website
document.addEventListener('DOMContentLoaded', function() {
    // Waitlist button functionality
    const waitlistButton = document.querySelector('.button-primary');
    if (waitlistButton) {
        waitlistButton.addEventListener('click', function(e) {
            e.preventDefault();
            alert('This is a concept demonstration. The product is not actually available for purchase yet. Join our waitlist coming soon!');
        });
    }

    // === NAVIGATION FUNCTIONALITY ===
    // Get navigation elements
    const menuToggle = document.querySelector('.menu-toggle');
    const primaryNav = document.querySelector('.primary-navigation-container');
    const navLinks = document.querySelectorAll('.nav-link');
    const body = document.body;

    if (menuToggle && primaryNav) {
        // Initialize mobile menu state
        menuToggle.setAttribute('aria-expanded', 'false');
        primaryNav.setAttribute('data-visible', 'false');

        // Handle menu toggle click
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            toggleMenu(!isExpanded);
        });

        // Toggle menu function
        function toggleMenu(open) {
            menuToggle.setAttribute('aria-expanded', open);
            primaryNav.setAttribute('data-visible', open);
            
            // Prevent body scroll when menu is open
            body.style.overflow = open ? 'hidden' : '';
            
            // Focus first nav link when menu opens for accessibility
            if (open) {
                setTimeout(() => {
                    navLinks[0]?.focus();
                }, 100);
            }
        }

        // Close menu function
        function closeMenu() {
            toggleMenu(false);
            menuToggle.focus(); // Return focus to toggle button
        }

        // Trap focus inside mobile menu when open
        primaryNav.addEventListener('keydown', function(e) {
            if (primaryNav.getAttribute('data-visible') !== 'true') return;
            
            if (e.key === 'Tab') {
                const focusable = Array.from(primaryNav.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'));
                const firstFocusable = focusable[0];
                const lastFocusable = focusable[focusable.length - 1];
                
                if (e.shiftKey && document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
            
            if (e.key === 'Escape') {
                closeMenu();
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (primaryNav.getAttribute('data-visible') === 'true' && 
                !menuToggle.contains(e.target) && 
                !primaryNav.contains(e.target)) {
                closeMenu();
            }
        });

        // Close menu when clicking on nav links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (primaryNav.getAttribute('data-visible') === 'true') {
                    closeMenu();
                    
                    // Smooth scroll to section when link clicked
                    const href = link.getAttribute('href');
                    if (href.startsWith('#')) {
                        const target = document.querySelector(href);
                        if (target) {
                            setTimeout(() => {
                                const headerOffset = 80;
                                const elementPosition = target.getBoundingClientRect().top;
                                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                                window.scrollTo({
                                    top: offsetPosition,
                                    behavior: 'smooth'
                                });
                            }, 100);
                        }
                    }
                }
            });
        });
        
        // Close menu when window is resized to desktop size
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && primaryNav.getAttribute('data-visible') === 'true') {
                closeMenu();
            }
        });

        // Add keyboard support for menu toggle
        menuToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
                toggleMenu(!isExpanded);
            }
        });
    }

    // === SCROLL AND ANIMATION FUNCTIONALITY ===
    let ticking = false;
    
    function updateScrollProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        // Back to top button visibility
        if (backToTopButton) {
            if (scrollTop > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        }
        
        // Highlight active nav section based on scroll
        highlightActiveNavLink(scrollTop);
        
        ticking = false;
    }

    function highlightActiveNavLink(scrollPos) {
        // Get all sections
        const sections = document.querySelectorAll('section[id]');
        
        // Find the current section
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                // Remove active class from all links
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to corresponding nav link
                document.querySelector(`a[href="#${sectionId}"]`)?.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(updateScrollProgress);
            ticking = true;
        }
    }, { passive: true });
    
    // Back to top button
    const backToTopButton = document.querySelector('.back-to-top');
    if (backToTopButton) {
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Trigger initial scroll event to setup UI state
    window.dispatchEvent(new Event('scroll'));

    // === FADE IN ANIMATIONS ===
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const fadeElements = document.querySelectorAll('.fade-in');
    
    if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        fadeElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        fadeElements.forEach(el => el.classList.add('visible'));
    }
    
    // Respect reduced motion preferences
    function respectReducedMotion() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
            
            fadeElements.forEach(el => {
                el.classList.add('visible');
            });
        }
    }
    
    respectReducedMotion();

    // === INTERACTIVE DEMO FUNCTIONALITY ===
    const iframe = document.querySelector('.eink-iframe');
    const widgetButtons = document.querySelectorAll('.widget-btn');
    
    // Wait for iframe to load
    if (iframe) {
        iframe.onload = function() {
            // Add click event listeners to widget buttons
            widgetButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Remove active class from all buttons
                    widgetButtons.forEach(btn => btn.classList.remove('active'));
                    
                    // Add active class to clicked button
                    this.classList.add('active');
                    
                    // Get the widget type from data attribute
                    const widgetType = this.getAttribute('data-widget');
                    
                    // Create an e-ink refresh effect
                    iframe.style.opacity = 0.3;
                    setTimeout(() => {
                        iframe.style.opacity = 0.7;
                        
                        // Send message to iframe to show the selected widget
                        iframe.contentWindow.postMessage({
                            action: 'showWidget',
                            widget: widgetType
                        }, '*');
                        
                        setTimeout(() => {
                            iframe.style.opacity = 1;
                        }, 200);
                    }, 200);
                });
            });
        };
    }
});