const SQUARE_PAYMENT_LINK = 'https://square.link/u/hAlPR6Ym';
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
        const stallPrice = '300';

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

        if (!valid) return;

        // Show loading
        submitBtn.querySelector('.btn-text').style.display = 'none';
        submitBtn.querySelector('.btn-loader').style.display = 'inline-flex';
        submitBtn.disabled = true;

        try {
            const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
        'form-name': 'vendor-register',
        businessName, ownerName, email, description, stallPrice,
    }).toString(),
});
            if (res.ok) {
                formMessage.className = 'form-message success';
                formMessage.textContent = 'Details received — continue to payment to confirm your booth.';
                formMessage.style.display = 'block';
                form.reset();

                if (SQUARE_PAYMENT_LINK) {
                    formMessage.textContent = 'Details saved. Opening secure checkout — your booth is held while you pay.';
                    setTimeout(function () { window.location.href = SQUARE_PAYMENT_LINK; }, 1500);
                }
            } else {
                formMessage.className = 'form-message error';
                formMessage.textContent = 'Something went wrong. Please email us at global_sales@ensembleexhibit.com.';
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
/* ---- Return from Square checkout ---- */
(function () {
    if (!new URLSearchParams(window.location.search).has('paid')) return;
    var section = document.getElementById('register');
    if (!section) return;
    var wrap = section.querySelector('.register-wrapper') || section;
    var panel = document.createElement('div');
    panel.setAttribute('role', 'status');
    panel.style.cssText = 'grid-column:1/-1;padding:28px;margin-bottom:24px;border:1px solid #C9A44A;' +
        'border-radius:8px;background:#F5EDE0;text-align:center;';
    panel.innerHTML =
        '<h3 style="color:#6B1D2A;margin:0 0 8px;">Your booth is confirmed</h3>' +
        '<p style="margin:0;color:#2C2C2C;">Payment received — Square has emailed your receipt. ' +
        'We\'ll follow up with booth setup details and load-in times before August 23.</p>';
    wrap.insertBefore(panel, wrap.firstChild);
    var form = document.getElementById('vendorForm');
    if (form) form.style.display = 'none';
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState({}, '', window.location.pathname);
})();
