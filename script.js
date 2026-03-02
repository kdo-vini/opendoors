/* ============================================
   OPEN DOORS - JAVASCRIPT
   Premium Institutional Website
   ============================================ */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules — ORDER MATTERS:
    // GSAP must register ScrollTrigger BEFORE Lenis hooks into it
    initPreloader();
    initCustomCursor();
    initGSAP();          // 1st: registers ScrollTrigger plugin
    initLenis();         // 2nd: hooks into gsap.ticker + ScrollTrigger.update
    initScrollAnimations();
    initCounterUp();
    initFormHandler();
    initCurrentYear();
    initMobileSwipeIndicator();

    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

/* --- PRELOADER --- */
function initPreloader() {
    const preloader = document.getElementById('preloader');

    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');

            // Remove from DOM after animation
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 600);
        }, 2000); // Show preloader for 2 seconds
    });
}

/* --- CUSTOM CURSOR --- */
function initCustomCursor() {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');

    if (!cursor || !follower) return;

    // Check if it's a touch device
    if ('ontouchstart' in window) {
        cursor.style.display = 'none';
        follower.style.display = 'none';
        return;
    }

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth cursor animation
    function animateCursor() {
        // Cursor follows mouse directly
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;

        // Follower follows with more lag
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;

        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';

        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';

        requestAnimationFrame(animateCursor);
    }

    animateCursor();

    // Hover effects on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .service-card, .portfolio-card, .testimonial-card');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            follower.classList.add('hover');
        });

        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            follower.classList.remove('hover');
        });
    });
}

/* --- LENIS SMOOTH SCROLL --- */
let lenis;

function initLenis() {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        // 'direction' and 'smooth' were removed in Lenis v1.x
        // Use 'orientation' and 'smoothWheel' instead
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        smoothTouch: false, // Mobile should use native hardware-accelerated momentum scroll
        touchMultiplier: 2,
    });

    // Use GSAP ticker only — do NOT add a separate requestAnimationFrame loop
    // (calling lenis.raf twice per frame causes performance issues and jank)
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Integrate with GSAP ScrollTrigger
    // ScrollTrigger is guaranteed to exist here because initGSAP() runs first
    lenis.on('scroll', ScrollTrigger.update);
}

/* --- GSAP SETUP & DOOR ANIMATION --- */
function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);

    // VERY IMPORTANT FOR MOBILE:
    // Hiding/showing the URL bar on mobile triggers a resize event.
    // By default, GSAP recalculates all ScrollTriggers on resize, causing massive scroll stutter.
    ScrollTrigger.config({ ignoreMobileResize: true });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth <= 768;

    const hero = document.getElementById('hero');
    const overlayContainer = document.querySelector('.overlay-container');

    if (prefersReducedMotion || isMobile) {
        // Skip the door animation for accessibility/low power mode OR mobile devices
        // Make the hero immediately visible
        gsap.set('.site-content', { opacity: 1, scale: 1 });

        // Move doors out of the way (though they are display:none on mobile anyway)
        gsap.set('.door.left', { x: '-100%' });
        gsap.set('.door.right', { x: '100%' });

        // Hide overlay container so it doesn't block clicks
        if (overlayContainer) overlayContainer.style.visibility = 'hidden';

        if (hero) {
            hero.style.visibility = 'visible';
            hero.style.pointerEvents = 'auto';
        }

    } else {
        // Door Opening Animation — SENIOR ARCHITECTURE (Pinning)
        // We pin the entire #hero-container wrapper while scrubbing the doors open.
        // This eliminates all mobile Safari 100vh bugs!
        const doorTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: "#hero-container",
                start: "top top",
                end: "+=150%", // Scroll distance to open doors (adjust for speed)
                pin: true,     // Magic: freezes the hero section while doors open
                scrub: 1,      // Smooth scrubbing
                onLeave: () => {
                    // Hide overlay so it doesn't block clicks on content below
                    if (overlayContainer) overlayContainer.style.visibility = 'hidden';
                },
                onEnterBack: () => {
                    if (overlayContainer) overlayContainer.style.visibility = 'visible';
                }
            }
        });

        doorTimeline
            // Open doors
            .to(".door.left", { x: "-100%", ease: "none" }, 0)
            .to(".door.right", { x: "100%", ease: "none" }, 0)
            // Fade out door text
            .to(".door.left .door-text", { x: -100, opacity: 0, ease: "power1.in" }, 0)
            .to(".door.right .door-text", { x: 100, opacity: 0, ease: "power1.in" }, 0)
            // Reveal hero content smoothly via scale and opacity
            .to(".site-content", { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }, 0.1);
    }

    // Marquee animation enhancement
    gsap.to(".marquee-track", {
        scrollTrigger: {
            trigger: ".marquee-section",
            start: "top bottom",
            end: "bottom top",
            scrub: 1
        },
        x: -100,
        ease: "none"
    });
}

/* --- SCROLL ANIMATIONS --- */
function initScrollAnimations() {
    // Fade up elements
    const fadeUpElements = document.querySelectorAll('.fade-up');

    fadeUpElements.forEach((el, index) => {
        gsap.fromTo(el,
            {
                opacity: 0,
                y: 60
            },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    end: "top 50%",
                    toggleActions: "play none none none"
                }
            }
        );
    });

    // Scale in elements
    const scaleElements = document.querySelectorAll('.scale-in');

    scaleElements.forEach(el => {
        gsap.fromTo(el,
            {
                opacity: 0,
                scale: 0.9
            },
            {
                opacity: 1,
                scale: 1,
                duration: 0.8,
                ease: "back.out(1.4)",
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    toggleActions: "play none none none"
                }
            }
        );
    });

    const isMobileScroll = window.innerWidth <= 768;

    // Service cards stagger (guard: only if elements exist)
    if (document.querySelector('.services-grid')) {
        gsap.fromTo(".service-card",
            { opacity: 0, y: isMobileScroll ? 20 : 80, scale: isMobileScroll ? 0.98 : 0.9 },
            {
                opacity: 1, y: 0, scale: 1,
                duration: isMobileScroll ? 0.5 : 0.8,
                stagger: isMobileScroll ? 0.05 : 0.15,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: ".services-grid",
                    start: "top 80%",
                    toggleActions: "play none none none"
                }
            }
        );
    }

    // Process timeline
    const processSteps = document.querySelectorAll('.process-step');

    processSteps.forEach((step, index) => {
        ScrollTrigger.create({
            trigger: step,
            start: "top 70%",
            onEnter: () => {
                step.classList.add('active');
                gsap.to(step.querySelector('.step-number'), {
                    scale: 1.1, duration: 0.3, yoyo: true, repeat: 1
                });
            }
        });
    });

    // CTA section parallax
    if (document.querySelector('.cta-section')) {
        gsap.to(".cta-content", {
            scrollTrigger: {
                trigger: ".cta-section",
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            },
            y: -30, ease: "none"
        });
    }

    // Contact form
    if (document.querySelector('.contact-grid')) {
        gsap.fromTo(".contact-form",
            { opacity: 0, x: 50 },
            {
                opacity: 1, x: 0, duration: 1, ease: "power3.out",
                scrollTrigger: {
                    trigger: ".contact-grid",
                    start: "top 75%",
                    toggleActions: "play none none none"
                }
            }
        );
    }
}

/* --- COUNTER UP ANIMATION --- */
function initCounterUp() {
    const counters = document.querySelectorAll('.marquee-item .number[data-count]');

    const animateCounter = (el) => {
        const target = parseInt(el.getAttribute('data-count'));
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);

            const current = Math.floor(start + (target - start) * easeOutQuart);
            el.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                el.textContent = target;
            }
        };

        requestAnimationFrame(updateCounter);
    };

    // Trigger counter animation when marquee section is in view
    ScrollTrigger.create({
        trigger: ".marquee-section",
        start: "top 90%",
        once: true,
        onEnter: () => {
            counters.forEach(counter => {
                animateCounter(counter);
            });
        }
    });
}

/* --- FORM HANDLER --- */
function initFormHandler() {
    const form = document.getElementById('contact-form');
    const phoneInput = document.getElementById('phone');

    if (!form) return;

    // Phone masking logic
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);

            let masked = '';
            if (value.length > 0) {
                masked = '(' + value.substring(0, 2);
                if (value.length > 2) {
                    masked += ') ' + value.substring(2, 7);
                    if (value.length > 7) {
                        masked += '-' + value.substring(7, 11);
                    }
                }
            }
            e.target.value = masked;
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const message = document.getElementById('message').value;

        // Create personalized and professional WhatsApp message
        const whatsappMessage = encodeURIComponent(
            `Olá! Sou ${name} e acabei de visitar o site da Open Doors.\n\n` +
            `Gostaria de entrar em contato para conversarmos sobre um projeto. Aqui estão meus dados:\n\n` +
            `*Telefone:* ${phone}\n` +
            `*Email:* ${email}\n\n` +
            `*Mensagem:*\n"${message}"`
        );

        // Open WhatsApp with the message
        const waUrl = `https://wa.me/5514991810574?text=${whatsappMessage}`;

        // Show success feedback
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = '✓ Redirecionando...';
        btn.disabled = true;

        setTimeout(() => {
            window.open(waUrl, '_blank');
            btn.textContent = originalText;
            btn.disabled = false;
            form.reset();
        }, 1500);
    });
}

/* --- CURRENT YEAR --- */
function initCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

/* --- MOBILE SWIPE INDICATOR --- */
function initMobileSwipeIndicator() {
    const indicator = document.getElementById('mobile-swipe-indicator');

    if (!indicator) return;

    // Hide indicator once user starts scrolling
    let hasScrolled = false;

    const hideIndicator = () => {
        if (!hasScrolled && window.scrollY > 50) {
            hasScrolled = true;
            indicator.classList.add('hidden');
        }
    };

    // Listen for scroll
    window.addEventListener('scroll', hideIndicator, { passive: true });

    // Also hide on touch start (for immediate feedback)
    document.addEventListener('touchstart', () => {
        if (!hasScrolled) {
            setTimeout(() => {
                if (window.scrollY > 50) {
                    hasScrolled = true;
                    indicator.classList.add('hidden');
                }
            }, 500);
        }
    }, { passive: true });
}

/* --- SMOOTH SCROLL FOR ANCHOR LINKS --- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');

        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            e.preventDefault();

            // Use Lenis for smooth scrolling
            lenis.scrollTo(targetElement, {
                offset: -50,
                duration: 1.5,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        }
    });
});

/* --- PARALLAX ON ABOUT CARD (desktop only) --- */
const isTouchDevice = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;

if (!isTouchDevice()) {
    document.addEventListener('mousemove', (e) => {
        const aboutCard = document.querySelector('.about-card');

        if (!aboutCard) return;

        const rect = aboutCard.getBoundingClientRect();
        const isHovering = (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
        );

        if (isHovering) {
            const x = (e.clientX - rect.left - rect.width / 2) / 25;
            const y = (e.clientY - rect.top - rect.height / 2) / 25;

            aboutCard.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg)`;
        } else {
            aboutCard.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
        }
    });
}

/* --- MAGNETIC BUTTONS (desktop only — touch devices don't have hover) --- */
if (!isTouchDevice()) {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0px, 0px)';
        });
    });
}

/* --- PORTFOLIO CAROUSEL NAVIGATION --- */
(function initPortfolioCarousel() {
    const carousel = document.querySelector('.portfolio-carousel');
    const track = document.querySelector('.carousel-track');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');

    if (!carousel || !track) return;

    // Get half the track width (since we duplicated items)
    const getScrollAmount = () => {
        const items = track.querySelectorAll('.carousel-item');
        const itemCount = items.length / 2; // Half since duplicated
        if (items.length === 0) return 200;
        const itemWidth = items[0].offsetWidth;
        const gap = parseInt(getComputedStyle(track).gap) || 32;
        return itemWidth + gap;
    };

    // Pause animation on hover is handled by CSS
    // Manual navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            // Temporarily pause animation and scroll
            track.style.animationPlayState = 'paused';
            track.style.transform = `translateX(${getScrollAmount()}px)`;

            setTimeout(() => {
                track.style.transform = '';
                track.style.animationPlayState = 'running';
            }, 500);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            // Temporarily pause animation and scroll
            track.style.animationPlayState = 'paused';
            track.style.transform = `translateX(-${getScrollAmount()}px)`;

            setTimeout(() => {
                track.style.transform = '';
                track.style.animationPlayState = 'running';
            }, 500);
        });
    }

    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;

    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].clientX; // clientX is relative to viewport (correct)
        isSwiping = true;
        track.style.animationPlayState = 'paused';
    }, { passive: true });

    carousel.addEventListener('touchmove', (e) => {
        // Track movement to improve responsiveness
        if (isSwiping) {
            touchEndX = e.changedTouches[0].clientX;
        }
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        isSwiping = false;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left - go to next
                track.style.transform = `translateX(-${getScrollAmount()}px)`;
            } else {
                // Swiped right - go to prev
                track.style.transform = `translateX(${getScrollAmount()}px)`;
            }
        }

        setTimeout(() => {
            track.style.transform = '';
            track.style.animationPlayState = 'running';
        }, 500);
    }
})();

/* --- TYPING EFFECT FOR HERO (Optional Enhancement) --- */
(function initTypingEffect() {
    // This can be enabled for a typing effect on the hero section
    // Currently disabled to maintain the static gradient text
})();

console.log('🚪 Open Doors - Website loaded successfully!');
