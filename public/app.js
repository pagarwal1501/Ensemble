/* =========================================
   ENSEMBLE BEYOND BORDERS — App Logic
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    // ---- Scroll reveal ----
    const revealEls = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));

    // ---- Navbar scroll behaviour ----
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        navbar.classList.toggle('scrolled', scrollY > 60);
        lastScroll = scrollY;
    });

    // ---- Mobile nav toggle ----
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    // Close mobile nav when a link is clicked
    navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });

    // ---- Smooth scroll for anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                const offset = navbar.offsetHeight + 16;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ---- Vendor Registration Form ----
    const form = document.getElementById('vendorForm');
    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('formMessage');

    function showError(id, message) {
        const el = document.getElementById(id);
        if (el) el.textContent = message;
        const input =
            el && el.previousElementSibling && el.previousElementSibling.tagName
                ? el.previousElementSibling
                : null;
        if (input && (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA')) {
            input.classList.add('error');
        }
    }

    function clearErrors() {
        document.querySelectorAll('.form-error').forEach((el) => (el.textContent = ''));
        document.querySelectorAll('.error').forEach((el) => el.classList.remove('error'));
        formMessage.className = 'form-message';
        formMessage.style.display = 'none';
        formMessage.textContent = '';
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const businessName = form.businessName.value.trim();
        const ownerName = form.ownerName.value.trim();
        const email = form.email.value.trim();
        const description = form.description.value.trim();
        const stallPriceEl = form.querySelector('input[name="stallPrice"]:checked');
        const stallPrice = stallPriceEl ? stallPriceEl.value : '';

        let valid = true;

        if (!businessName) {
            showError('businessNameError', 'Business name is required.');
            valid = false;
        }
        if (!ownerName) {
            showError('ownerNameError', 'Owner name is required.');
            valid = false;
        }
        if (!email) {
            showError('emailError', 'Email address is required.');
            valid = false;
        } else if (!isValidEmail(email)) {
            showError('emailError', 'Please enter a valid email address.');
            valid = false;
        }
        if (!description) {
            showError('descriptionError', 'Please describe your business.');
            valid = false;
        }
        if (!stallPrice) {
            showError('stallPriceError', 'Please select a booth tier.');
            valid = false;
        }

        if (!valid) return;

        // Show loading
        submitBtn.querySelector('.btn-text').style.display = 'none';
        submitBtn.querySelector('.btn-loader').style.display = 'inline-flex';
        submitBtn.disabled = true;

        try {
            const res = await fetch('/api/vendor-register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessName, ownerName, email, description, stallPrice }),
            });

            const data = await res.json();

            if (data.success) {
                formMessage.className = 'form-message success';
                formMessage.textContent = data.message;
                formMessage.style.display = 'block';
                form.reset();
            } else {
                formMessage.className = 'form-message error';
                formMessage.textContent = (data.errors || ['Something went wrong.']).join(' ');
                formMessage.style.display = 'block';
            }
        } catch (err) {
            formMessage.className = 'form-message error';
            formMessage.textContent = 'Network error. Please check your connection and try again.';
            formMessage.style.display = 'block';
        } finally {
            submitBtn.querySelector('.btn-text').style.display = 'inline';
            submitBtn.querySelector('.btn-loader').style.display = 'none';
            submitBtn.disabled = false;
        }
    });
});
