// Performance optimization: Throttle and Debounce utilities
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

function debounce(func, delay) {
    let timeoutId;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(context, args), delay);
    }
}

// ========== Particle Network Animation ==========
class ParticleNetwork {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        
        // Adjust particle count by device
        if (window.innerWidth < 768) {
            this.particleCount = 15;
            this.connectionDistance = 100;
        } else if (window.innerWidth < 1024) {
            this.particleCount = 25;
            this.connectionDistance = 120;
        } else {
            this.particleCount = 50;
            this.connectionDistance = 150;
        }
        
        this.particleRadius = 2;
        this.animationId = null;
        this.isVisible = true;
        
        this.resizeCanvas();
        this.createParticles();
        this.animate();
        
        window.addEventListener('resize', () => this.resizeCanvas());
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Stop animation when tab is hidden to save battery
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAnimation();
            } else {
                this.startAnimation();
            }
        });
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: this.particleRadius,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
    }
    
    handleMouseMove(e) {
        if (!this.particles) return;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const repelDistance = 100;
        
        this.particles.forEach(particle => {
            const dx = mouseX - particle.x;
            const dy = mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < repelDistance) {
                const angle = Math.atan2(dy, dx);
                particle.vx -= Math.cos(angle) * 0.3;
                particle.vy -= Math.sin(angle) * 0.3;
            }
        });
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            // Keep particles in bounds
            particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
            
            // Apply slow friction
            particle.vx *= 0.998;
            particle.vy *= 0.998;
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawConnections() {
        const lineColor = 'rgba(99, 102, 241, 0.15)';
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.connectionDistance) {
                    const opacity = 1 - (distance / this.connectionDistance);
                    this.ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.3})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    animate = () => {
        if (!this.isVisible) return;
        this.clear();
        this.updateParticles();
        this.drawConnections();
        this.drawParticles();
        this.animationId = requestAnimationFrame(this.animate);
    }
    
    startAnimation() {
        this.isVisible = true;
        if (!this.animationId) {
            this.animate();
        }
    }
    
    stopAnimation() {
        this.isVisible = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

// Initialize particle network on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    new ParticleNetwork('particleCanvas');
});

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-links a');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const themeToggle = document.getElementById('themeToggle');
const backToTop = document.getElementById('backToTop');
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

// Optional: configure your Formspree endpoint. If left empty, the script will use the form's `action` attribute.
// Replace with your Formspree form ID, e.g. 'https://formspree.io/f/abcd1234' or leave blank to use markup.
let FORMSPREE_ENDPOINT = '';

// Initialize AOS with performance settings
const aosConfig = {
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 50,
    disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'all' : false
};

if (window.AOS) {
    AOS.init(aosConfig);
}

// Loading Screen
window.addEventListener('load', () => {
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.visibility = 'hidden';
    }, 500); // Reduced from 2000ms to 500ms for better UX
});

// Typed.js Animation (guarded)
if (window.Typed) {
    try {
        new Typed('.typed-cursor', {
            strings: ['Data Science Engineer', 'AI Enthusiast', 'Machine Learning Developer', 'Problem Solver'],
            typeSpeed: 100,
            backSpeed: 50,
            backDelay: 2000,
            loop: true,
            showCursor: false
        });
    } catch (err) {
        // If Typed fails for any reason, fallback to static text
        const el = document.querySelector('.typed-cursor');
        if (el) el.textContent = 'Data Science Engineer';
        console.warn('Typed.js initialization failed:', err);
    }
} else {
    // If Typed.js isn't available yet, ensure a graceful fallback
    const el = document.querySelector('.typed-cursor');
    if (el) el.textContent = 'Data Science Engineer';
}

// Navigation
function updateActiveLink() {
    const sections = document.querySelectorAll('section');
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

function toggleNavbar() {
    const scrolled = window.scrollY > 50;
    navbar.classList.toggle('scrolled', scrolled);
}

function toggleMobileMenu() {
    const isActive = navMenu.classList.contains('active');
    
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = isActive ? 'auto' : 'hidden';
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('active') && 
        !navMenu.contains(e.target) && 
        !hamburger.contains(e.target)) {
        toggleMobileMenu();
    }
});

// Close menu on resize to desktop
window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && navMenu.classList.contains('active')) {
        toggleMobileMenu();
    }
});

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }

        // Close mobile menu
        if (navMenu.classList.contains('active')) {
            toggleMobileMenu();
        }
    });
});

hamburger.addEventListener('click', toggleMobileMenu);

// Scroll Events - Optimized with throttling
let scrollIndicatorHidden = false;
const handleScroll = throttle(() => {
    updateActiveLink();
    toggleNavbar();

    // Back to top button
    if (window.scrollY > 300) {
        backToTop.style.display = 'flex';
    } else {
        backToTop.style.display = 'none';
    }
    
    // Hide scroll indicator after first scroll
    if (!scrollIndicatorHidden && window.scrollY > 100) {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.style.display = 'none';
            scrollIndicatorHidden = true;
        }
    }
}, 100);

window.addEventListener('scroll', handleScroll, { passive: true });

backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Theme Toggle
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    // Removed localStorage dependency to prevent SecurityError in sandbox
    
    // Update visuals and accessibility without overwriting innerHTML
    if (themeToggle) {
        themeToggle.classList.toggle('light-mode', newTheme === 'light');
        // update aria-pressed for assistive tech
        themeToggle.setAttribute('aria-pressed', newTheme === 'light' ? 'true' : 'false');

        // Toggle which icon is visible (both icons exist in markup)
        const moonIcon = themeToggle.querySelector('.fa-moon');
        const sunIcon = themeToggle.querySelector('.fa-sun');
        if (moonIcon && sunIcon) {
            if (newTheme === 'light') {
                sunIcon.style.display = 'inline-block';
                moonIcon.style.display = 'none';
                sunIcon.setAttribute('aria-hidden', 'false');
                moonIcon.setAttribute('aria-hidden', 'true');
            } else {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'inline-block';
                sunIcon.setAttribute('aria-hidden', 'true');
                moonIcon.setAttribute('aria-hidden', 'false');
            }
        }
    }
}

// Initialize Theme on DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme toggle element
    const savedTheme = 'dark'; // Default to dark theme, removed localStorage dependency
    const html = document.documentElement;
    
    // Always set the data-theme attribute explicitly
    if (savedTheme === 'light') {
        html.setAttribute('data-theme', 'light');
        if (themeToggle) {
            themeToggle.classList.add('light-mode');
            themeToggle.setAttribute('aria-pressed', 'true');
            const moonIcon = themeToggle.querySelector('.fa-moon');
            const sunIcon = themeToggle.querySelector('.fa-sun');
            if (moonIcon && sunIcon) {
                sunIcon.style.display = 'inline-block';
                moonIcon.style.display = 'none';
                sunIcon.setAttribute('aria-hidden', 'false');
                moonIcon.setAttribute('aria-hidden', 'true');
            }
        }
    } else {
        html.setAttribute('data-theme', 'dark'); // Explicitly set to dark
        if (themeToggle) {
            themeToggle.classList.remove('light-mode');
            themeToggle.setAttribute('aria-pressed', 'false');
            const moonIcon = themeToggle.querySelector('.fa-moon');
            const sunIcon = themeToggle.querySelector('.fa-sun');
            if (moonIcon && sunIcon) {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'inline-block';
                sunIcon.setAttribute('aria-hidden', 'true');
                moonIcon.setAttribute('aria-hidden', 'false');
            }
        }
    }

    // Attach event listener
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});

// Projects Filtering - Function defined globally
function filterProjects(filter) {
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        const categories = card.getAttribute('data-category').split(' ');
        const shouldShow = filter === 'all' || categories.includes(filter);

        if (shouldShow) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            }, 100);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.8)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

// Skills Tabs - Functions defined globally
function switchTab(tabId) {
    const tabButtons = document.querySelectorAll('.tab-btn[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');
    
    console.log('Switching to tab:', tabId);
    // Update active tab button
    tabButtons.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // Show active tab content
    tabContents.forEach(content => content.classList.remove('active'));
    const activeContent = document.getElementById(tabId);
    if (activeContent) activeContent.classList.add('active');

    // Animate skill bars
    animateSkillBars();
}

// Animate skill bars
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = width;
        }, 100);
    });
}

// Trigger skill bar animation on page load
window.addEventListener('load', () => {
    setTimeout(animateSkillBars, 1000);
});

// Project Modal Functionality (ARIA + focus management)
const projectModal = document.getElementById('projectModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const projectCards = document.querySelectorAll('.project-card');
const modalContentEl = document.getElementById('modalContent');

let _lastFocusedElement = null;
let _focusTrapHandler = null;

function trapFocus(container) {
    const focusableSelectors = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]';
    const focusable = Array.from(container.querySelectorAll(focusableSelectors)).filter(el => el.offsetParent !== null);
    if (!focusable.length) return null;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handler = function(e) {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else { // Tab
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    };

    document.addEventListener('keydown', handler);
    return handler;
}

function releaseFocusTrap(handler) {
    if (handler) document.removeEventListener('keydown', handler);
}

function openProjectModal(projectCard) {
    const projectTitle = projectCard.querySelector('.project-info h3').textContent;
    const projectStatus = projectCard.querySelector('.project-status').textContent;
    const techTags = projectCard.querySelectorAll('.tech-tags span');
    const projectDetails = projectCard.querySelector('.project-details');
    const githubLink = projectCard.getAttribute('data-github');
    const demoLink = projectCard.getAttribute('data-demo');

    // Save last focused element
    _lastFocusedElement = document.activeElement;

    // Set modal content
    document.getElementById('modalTitle').textContent = projectTitle;
    document.getElementById('modalStatus').textContent = projectStatus;

    // Set tech tags
    const modalTech = document.getElementById('modalTech');
    modalTech.innerHTML = '';
    techTags.forEach(tag => {
        const span = document.createElement('span');
        span.textContent = tag.textContent;
        modalTech.appendChild(span);
    });

    // Set project details (if exists)
    const modalDetails = document.getElementById('modalDetails');
    if (projectDetails) {
        modalDetails.innerHTML = projectDetails.innerHTML;
    } else {
        modalDetails.innerHTML = '<p>No additional details available for this project.</p>';
    }

    // Set modal links
    const modalGithub = document.getElementById('modalGithub');
    const modalLiveDemo = document.getElementById('modalLiveDemo');

    if (githubLink) {
        modalGithub.href = githubLink;
        modalGithub.style.display = 'inline-block';
    } else {
        modalGithub.style.display = 'none';
    }

    if (demoLink) {
        modalLiveDemo.href = demoLink;
        modalLiveDemo.style.display = 'inline-block';
    } else {
        modalLiveDemo.style.display = 'none';
    }

    // Show modal
    projectModal.classList.add('active');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus management
    if (modalContentEl) {
        modalContentEl.focus();
        // trap focus inside modal
        _focusTrapHandler = trapFocus(modalContentEl);
    }
}

function closeProjectModal() {
    projectModal.classList.remove('active');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
    // release focus trap
    releaseFocusTrap(_focusTrapHandler);
    _focusTrapHandler = null;
    // restore focus
    if (_lastFocusedElement) {
        try { _lastFocusedElement.focus(); } catch (e) { /* ignore */ }
    }
}

// Attach click listeners to "View Details" buttons
projectCards.forEach(card => {
    const viewDetailsBtn = card.querySelector('.overlay-content .project-links .btn-primary');
    if (viewDetailsBtn) {
        viewDetailsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openProjectModal(card);
        });
    }
});

// Close modal listeners
if (modalClose) modalClose.addEventListener('click', closeProjectModal);
if (modalOverlay) modalOverlay.addEventListener('click', closeProjectModal);

// Close modal with Escape key (already in file but keep safe guard)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal && projectModal.classList.contains('active')) {
        closeProjectModal();
    }
});

// Certifications Filtering (single-select / OR semantics)
const certFilterButtons = document.querySelectorAll('.certifications .filter-btn[data-filter]');
const certCards = document.querySelectorAll('.cert-card');

function showCard(card) {
    card.classList.remove('fade-out');
    card.classList.add('fade-in-up');
    card.style.display = 'block';
    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
    }, 10);
}

function hideCard(card) {
    card.classList.remove('fade-in-up');
    card.classList.add('fade-out');
    card.style.opacity = '0';
    card.style.transform = 'scale(0.96)';
    setTimeout(() => { 
        card.style.display = 'none'; 
    }, 250);
}

function filterCertifications(filterValue) {
    certCards.forEach(card => {
        const platform = card.getAttribute('data-platform') || '';
        
        // Show all if 'all' is selected
        if (filterValue === 'all') {
            showCard(card);
        } else if (platform === filterValue) {
            // Show card if platform matches filter
            showCard(card);
        } else {
            // Hide card if it doesn't match
            hideCard(card);
        }
    });
}

// Single-select behavior for cert filter buttons
certFilterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const filter = button.getAttribute('data-filter');
        
        // Remove active class from all buttons
        certFilterButtons.forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Filter certifications
        filterCertifications(filter);
    });
});

// Contact Form
function validateForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !subject || !message) {
        showFormMessage('Please fill in all required fields.', 'error');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showFormMessage('Please enter a valid email address.', 'error');
        return false;
    }

    return true;
}

function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = 'block';

    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 5000);
}

function showLoading(show) {
    const btnText = document.querySelector('.btn-text');
    const btnSpinner = document.querySelector('.btn-spinner');

    if (show) {
        btnText.style.opacity = '0';
        btnSpinner.style.display = 'inline-block';
        contactForm.querySelector('button[type="submit"]').disabled = true;
    } else {
        btnText.style.opacity = '1';
        btnSpinner.style.display = 'none';
        contactForm.querySelector('button[type="submit"]').disabled = false;
    }
}

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    showLoading(true);

    // If a reCAPTCHA widget is present, ensure the user completed it before submitting.
    try {
        if (window.grecaptcha && typeof grecaptcha.getResponse === 'function') {
            const captchaResponse = grecaptcha.getResponse();
            if (!captchaResponse || captchaResponse.length === 0) {
                showFormMessage('Please complete the reCAPTCHA challenge before submitting.', 'error');
                showLoading(false);
                return;
            }
        }
    } catch (recapErr) {
        // Non-fatal: continue and allow server-side to validate if client-side check isn't available
        console.warn('reCAPTCHA check failed client-side:', recapErr);
    }
    // If FORMSPREE_ENDPOINT is configured, send form to Formspree (or any POST endpoint)
    // Prefer explicit FORMSPREE_ENDPOINT if configured, otherwise fall back to the form's action attribute
    const endpoint = (FORMSPREE_ENDPOINT && FORMSPREE_ENDPOINT.trim() !== '') ? FORMSPREE_ENDPOINT : (contactForm.getAttribute('action') || '');
    if (endpoint && endpoint.trim() !== '') {
        try {
            const formData = new FormData(contactForm);

            // If grecaptcha produced a token it will be included in the formData under 'g-recaptcha-response'
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            });

            if (res.ok) {
                showFormMessage('Thank you for your message! I\'ll get back to you soon.', 'success');
                contactForm.reset();
            } else {
                let data = {};
                try { data = await res.json(); } catch (err) { /* ignore json parse error */ }
                const errorMsg = data?.error || 'Sorry, there was a problem sending your message.';
                showFormMessage(errorMsg, 'error');
            }
        } catch (error) {
            showFormMessage('Network error. Please try again later.', 'error');
            console.error('Form submission error:', error);
        } finally {
            showLoading(false);
        }
    } else {
        // Fallback: simulated submission so the form still behaves during development
        try {
            await new Promise(resolve => setTimeout(resolve, 1200));
            showFormMessage('Thank you for your message! I\'ll get back to you soon.', 'success');
            contactForm.reset();
        } catch (error) {
            showFormMessage('Sorry, there was an error sending your message. Please try again.', 'error');
        } finally {
            showLoading(false);
        }
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        // Only prevent default for internal anchor links, not for modal links
        if (href === '#' || href.startsWith('#')) {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offsetTop = target.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.stat-card, .fact-item, .timeline-card, .project-card, .cert-card, .contact-card').forEach(el => {
    observer.observe(el);
});

// Parallax effect for hero background - Optimized
const handleParallax = throttle(() => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.backgroundPositionY = -(scrolled * 0.5) + 'px';
    }
}, 50);

window.addEventListener('scroll', handleParallax, { passive: true });

// Custom cursor - Only enable on desktop with fine pointer
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let cursor = document.querySelector('.cursor');
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.className = 'cursor';
        document.body.appendChild(cursor);
    }
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    }, true);

    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    }, true);

    // Add cursor styles dynamically
    const cursorStyles = `
    .cursor {
        position: fixed;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        pointer-events: none;
        z-index: 9999;
        transition: opacity 0.3s ease;
        opacity: 0;
        mix-blend-mode: difference;
    }
    `;

    const style = document.createElement('style');
    style.textContent = cursorStyles;
    document.head.appendChild(style);
} else {
    // Remove cursor on touch devices
    const cursor = document.querySelector('.cursor');
    if (cursor) cursor.remove();
}

// Performance optimization: Lazy loading images
const images = document.querySelectorAll('img[loading="lazy"]');
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
        }
    });
});

images.forEach(img => imageObserver.observe(img));

// Image error fallback: handle broken/missing project images via JS (avoid external placeholder files)
document.querySelectorAll('.project-image img').forEach(img => {
    img.addEventListener('error', () => {
        if (!img.dataset._errored) {
            img.dataset._errored = '1';
            // Inline SVG fallback encoded as a data URI to avoid relying on external placeholder files
            const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 240'><rect width='100%' height='100%' fill='%232b3440'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%94a3b8' font-size='18'>Image not available</text></svg>`;
            const dataUri = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
            try {
                img.src = dataUri;
            } catch (e) {
                // As a last resort hide the image and show alt text
                img.style.display = 'none';
            }
            img.removeAttribute('srcset');
            img.alt = img.alt || 'Project image not available';
            console.warn('Replaced missing project image with inline placeholder for', img);
        }
    });
});

// Initialize everything on page load
document.addEventListener('DOMContentLoaded', () => {
    updateActiveLink();
    toggleNavbar();

    // Initialize skill bars
    animateSkillBars();
    
    // Initialize tab switching
    const tabButtons = document.querySelectorAll('.tab-btn[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');
    
    console.log('Initializing tabs - Tab buttons found:', tabButtons.length);
    console.log('Initializing tabs - Tab contents found:', tabContents.length);
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            console.log('Tab clicked:', tabId);
            switchTab(tabId);
        });
    });
    
    // Initialize project filtering
    const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
    console.log('Initializing filters - Filter buttons found:', filterButtons.length);
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Filter projects
            const filter = button.getAttribute('data-filter');
            console.log('Filter clicked:', filter);
            filterProjects(filter);
        });
    });

    // Initialize certification filtering to show all cards by default
    filterCertifications(['all']);
    
    // Check CV availability and provide fallback if the hosted PDF is missing
    (function checkCvAvailability() {
        const cvPath = 'assets/cv/Aziz_Messaoud_CV-1.pdf';
        const cvLinks = document.querySelectorAll('a[href="' + cvPath + '"]');
        if (!cvLinks.length) return;

        // Try a HEAD request first; fall back to GET if HEAD is not supported by the host
        fetch(cvPath, { method: 'HEAD' }).then(res => {
            if (!res.ok) throw new Error('CV not found');
            // file exists, nothing to do
        }).catch(() => {
            // Replace each link with a mailto fallback and a small badge informing user
            cvLinks.forEach(link => {
                const mail = 'mailto:aziz.messaoud@esprit.tn?subject=CV%20Request&body=Hi%20Aziz,%20I%20would%20like%20to%20request%20your%20CV.';
                const span = document.createElement('span');
                span.className = 'cv-missing';
                span.textContent = 'CV (not hosted) — click to request via email';
                span.style.cursor = 'pointer';
                span.style.color = '#f8fafc';
                span.style.background = 'rgba(99,102,241,0.18)';
                span.style.padding = '6px 10px';
                span.style.borderRadius = '6px';
                span.addEventListener('click', () => { window.location.href = mail; });

                link.parentNode.replaceChild(span, link);
            });
            console.warn('CV not found at', cvPath, '- replaced Download link(s) with mailto fallback.');
        });
    })();
});