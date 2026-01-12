/* ============================================
   OPEN DOORS - JAVASCRIPT
   Premium Institutional Website
   ============================================ */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initPreloader();
    initCustomCursor();
    initLenis();
    initGSAP();
    initScrollAnimations();
    initCounterUp();
    initFormHandler();
    initCurrentYear();
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
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Integrate with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
}

/* --- GSAP SETUP & DOOR ANIMATION --- */
function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);

    // Door Opening Animation
    const doorTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: ".scroll-spacer",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5
        }
    });

    doorTimeline
        // Open doors
        .to(".door.left", {
            x: "-100%",
            ease: "power2.inOut"
        }, 0)
        .to(".door.right", {
            x: "100%",
            ease: "power2.inOut"
        }, 0)

        // Parallax on door text
        .to(".door.left .door-text", {
            x: -150,
            opacity: 0,
            ease: "power2.in"
        }, 0)
        .to(".door.right .door-text", {
            x: 150,
            opacity: 0,
            ease: "power2.in"
        }, 0)

        // Reveal content behind
        .to(".site-content", {
            opacity: 1,
            scale: 1,
            ease: "power2.out"
        }, 0);

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

    // Service cards stagger
    gsap.fromTo(".service-card",
        {
            opacity: 0,
            y: 80,
            scale: 0.9
        },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".services-grid",
                start: "top 80%",
                toggleActions: "play none none none"
            }
        }
    );

    // Process timeline
    const processSteps = document.querySelectorAll('.process-step');

    processSteps.forEach((step, index) => {
        ScrollTrigger.create({
            trigger: step,
            start: "top 70%",
            onEnter: () => {
                step.classList.add('active');

                // Add active class sequentially
                gsap.to(step.querySelector('.step-number'), {
                    scale: 1.1,
                    duration: 0.3,
                    yoyo: true,
                    repeat: 1
                });
            }
        });
    });

    // Portfolio cards
    gsap.fromTo(".portfolio-card",
        {
            opacity: 0,
            y: 100,
        },
        {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".portfolio-grid",
                start: "top 80%",
                toggleActions: "play none none none"
            }
        }
    );

    // Testimonial cards
    gsap.fromTo(".testimonial-card",
        {
            opacity: 0,
            x: 50,
        },
        {
            opacity: 1,
            x: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".testimonials-slider",
                start: "top 80%",
                toggleActions: "play none none none"
            }
        }
    );

    // CTA section parallax
    gsap.to(".cta-content", {
        scrollTrigger: {
            trigger: ".cta-section",
            start: "top bottom",
            end: "bottom top",
            scrub: 1
        },
        y: -30,
        ease: "none"
    });

    // Contact form
    gsap.fromTo(".contact-form",
        {
            opacity: 0,
            x: 50
        },
        {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".contact-grid",
                start: "top 75%",
                toggleActions: "play none none none"
            }
        }
    );
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

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        // Create WhatsApp message
        const whatsappMessage = encodeURIComponent(
            `*Nova mensagem do site Open Doors*\n\n` +
            `*Nome:* ${name}\n` +
            `*Email:* ${email}\n\n` +
            `*Mensagem:*\n${message}`
        );

        // Open WhatsApp with the message
        window.open(`https://wa.me/5500000000000?text=${whatsappMessage}`, '_blank');

        // Show success feedback
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = '✓ Redirecionando para WhatsApp...';
        btn.disabled = true;

        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
            form.reset();
        }, 3000);
    });
}

/* --- CURRENT YEAR --- */
function initCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
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

/* --- PARALLAX ON ABOUT CARD --- */
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

/* --- MAGNETIC BUTTONS --- */
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

/* --- TESTIMONIALS AUTO-SCROLL --- */
(function initTestimonialsAutoScroll() {
    const slider = document.querySelector('.testimonials-slider');

    if (!slider) return;

    let isHovering = false;
    let scrollAmount = 0;
    const scrollSpeed = 0.5;

    slider.addEventListener('mouseenter', () => isHovering = true);
    slider.addEventListener('mouseleave', () => isHovering = false);

    function autoScroll() {
        if (!isHovering) {
            scrollAmount += scrollSpeed;

            if (scrollAmount >= slider.scrollWidth - slider.clientWidth) {
                scrollAmount = 0;
            }

            slider.scrollLeft = scrollAmount;
        } else {
            scrollAmount = slider.scrollLeft;
        }

        requestAnimationFrame(autoScroll);
    }

    // Start auto-scroll after a delay
    setTimeout(() => {
        autoScroll();
    }, 3000);
})();

/* --- TYPING EFFECT FOR HERO (Optional Enhancement) --- */
(function initTypingEffect() {
    // This can be enabled for a typing effect on the hero section
    // Currently disabled to maintain the static gradient text
})();

console.log('🚪 Open Doors - Website loaded successfully!');
