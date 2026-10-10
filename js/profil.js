/**
 * Profil.js — Toute la logique de la page profil
 * Fichier externe = respecte la CSP (pas de inline script)
 */

// ================================
// 1. TABS
// ================================
function showTab(tabName) {
    var tabs = document.querySelectorAll('.tab-content');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.add('hidden');
        tabs[i].classList.remove('animate-fade-in');
    }

    var selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
        selectedTab.offsetHeight;
        selectedTab.classList.add('animate-fade-in');
    }

    var buttons = document.querySelectorAll('.tab-btn');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('tab-active');
        if (buttons[i].getAttribute('data-tab') === tabName) {
            buttons[i].classList.add('tab-active');
        }
    }

    try { history.pushState(null, '', '#' + tabName); } catch(e) {}
}

// ================================
// 2. LIGHTBOX
// ================================
function openLightbox(src) {
    var lightbox = document.getElementById('lightbox');
    var img = document.getElementById('lightbox-img');
    if (lightbox && img) {
        img.src = src;
        lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    var lightbox = document.getElementById('lightbox');
    var img = document.getElementById('lightbox-img');
    if (lightbox) {
        lightbox.classList.add('hidden');
        document.body.style.overflow = '';
    }
    if (img) img.src = '';
}

// ================================
// 3. SHARE MENU
// ================================
function toggleShareMenu(e) {
    if (e) e.stopPropagation();
    var menu = document.getElementById('shareMenu');
    if (menu) menu.classList.toggle('hidden');
}

function copyCurrentLink(linkEl) {
    var url = window.location.href;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function() {
            showCopySuccess(linkEl);
        }).catch(function() {
            fallbackCopy(url, linkEl);
        });
    } else {
        fallbackCopy(url, linkEl);
    }
}

function fallbackCopy(text, linkEl) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showCopySuccess(linkEl);
    } catch(err) {
        alert('Impossible de copier');
    }
    document.body.removeChild(textarea);
}

function showCopySuccess(linkEl) {
    if (linkEl) {
        var original = linkEl.innerHTML;
        linkEl.innerHTML = '<i class="fas fa-check mr-2"></i> Copié !';
        linkEl.style.color = '#16a34a';
        setTimeout(function() {
            linkEl.innerHTML = original;
            linkEl.style.color = '';
            var menu = document.getElementById('shareMenu');
            if (menu) menu.classList.add('hidden');
        }, 1500);
    }
}

// ================================
// 4. VOIR PLUS MEMBRES
// ================================
function toggleVoirPlus() {
    var cards = document.querySelectorAll('.membre-card');
    var btn = document.getElementById('voir-plus-btn');
    var expanded = false;

    for (var i = 9; i < cards.length; i++) {
        cards[i].classList.toggle('hidden');
        if (!cards[i].classList.contains('hidden')) expanded = true;
    }

    if (btn) {
        btn.innerHTML = expanded
            ? '<i class="fas fa-minus mr-1"></i> Voir moins'
            : '<i class="fas fa-plus mr-1"></i> Voir plus';
    }
}

// ================================
// 5. FORMULAIRE CONTACT
// ================================
function updateCharCount() {
    var msg = document.getElementById('message');
    var counter = document.getElementById('charCount');
    if (msg && counter) {
        var len = msg.value.length;
        counter.textContent = len + ' / 2000';
        counter.style.color = len > 1800 ? '#ef4444' : '#9ca3af';
    }
}

function handleContactSubmit(e) {
    e.preventDefault();

    var firstName = (document.getElementById('first-name').value || '').trim();
    var lastName = (document.getElementById('last-name').value || '').trim();
    var email = (document.getElementById('email').value || '').trim();
    var subject = (document.getElementById('subject').value || '');
    var message = (document.getElementById('message').value || '').trim();

    var errors = [];
    if (!firstName) errors.push('Prénom requis.');
    if (!lastName) errors.push('Nom requis.');
    if (!email || email.indexOf('@') === -1) errors.push('Email invalide.');
    if (!message || message.length < 10) errors.push('Message trop court.');

    if (errors.length > 0) {
        showFormFeedback(errors.join(' '), 'error');
        return;
    }

    var fullName = firstName + ' ' + lastName;
    var mailSubject = encodeURIComponent(subject || 'Message de ' + fullName);
    var mailBody = encodeURIComponent(
        'Nom : ' + fullName + '\nEmail : ' + email +
        '\nSujet : ' + subject + '\n\nMessage :\n' + message
    );

    // Récupérer l'email depuis data-attribute
    var pageData = document.getElementById('page-data');
    var orgEmail = pageData ? pageData.getAttribute('data-org-email') : 'contact@example.com';

    window.location.href = 'mailto:' + orgEmail + '?subject=' + mailSubject + '&body=' + mailBody;
    showFormFeedback("Votre client mail va s'ouvrir…", 'success');

    setTimeout(function() {
        document.getElementById('contactForm').reset();
        updateCharCount();
    }, 3000);
}

function showFormFeedback(msg, type) {
    var el = document.getElementById('form-feedback');
    if (!el) return;

    el.className = 'mb-4 p-3 rounded-lg text-sm font-medium';
    if (type === 'success') {
        el.className += ' bg-green-100 text-green-700 border border-green-300';
        el.innerHTML = '<i class="fas fa-check-circle mr-2"></i>' + msg;
    } else {
        el.className += ' bg-red-100 text-red-700 border border-red-300';
        el.innerHTML = '<i class="fas fa-exclamation-circle mr-2"></i>' + msg;
    }
    el.classList.remove('hidden');
    setTimeout(function() { el.classList.add('hidden'); }, 6000);
}

// ================================
// 6. INITIALISATION (DOMContentLoaded)
// ================================
document.addEventListener('DOMContentLoaded', function() {

    // --- Tabs ---
    var tabBtns = document.querySelectorAll('.tab-btn');
    for (var i = 0; i < tabBtns.length; i++) {
        tabBtns[i].addEventListener('click', function() {
            var tabName = this.getAttribute('data-tab');
            if (tabName) showTab(tabName);
        });
    }

    // --- Bouton Contact header ---
    var btnContact = document.getElementById('btn-contact');
    if (btnContact) {
        btnContact.addEventListener('click', function() {
            showTab('contact');
        });
    }

    // --- Share menu ---
    var shareBtn = document.getElementById('shareBtn');
    var shareMenu = document.getElementById('shareMenu');
    if (shareBtn) {
        shareBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleShareMenu(e);
        });
    }

    // --- Copy link ---
    var copyLinkBtn = document.getElementById('copyLinkBtn');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            copyCurrentLink(this);
        });
    }

    // --- Fermer share menu en cliquant ailleurs ---
    document.addEventListener('click', function(e) {
        if (shareMenu && shareBtn && !shareMenu.contains(e.target) && e.target !== shareBtn) {
            shareMenu.classList.add('hidden');
        }
    });

    // --- Lightbox: gallery items ---
    var lightboxItems = document.querySelectorAll('[data-lightbox]');
    for (var i = 0; i < lightboxItems.length; i++) {
        lightboxItems[i].addEventListener('click', function() {
            var src = this.getAttribute('data-lightbox');
            if (src) openLightbox(src);
        });
    }

    // --- Lightbox: close ---
    var lightbox = document.getElementById('lightbox');
    var lightboxClose = document.getElementById('lightbox-close');

    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) closeLightbox();
        });
    }
    if (lightboxClose) {
        lightboxClose.addEventListener('click', function() {
            closeLightbox();
        });
    }

    // --- Voir plus membres ---
    var voirPlusBtn = document.getElementById('voir-plus-btn');
    if (voirPlusBtn) {
        voirPlusBtn.addEventListener('click', toggleVoirPlus);
    }

    // --- Formulaire contact ---
    var contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    // --- Compteur caractères ---
    var messageField = document.getElementById('message');
    if (messageField) {
        messageField.addEventListener('input', updateCharCount);
    }

    // --- Échap ---
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeLightbox();
            if (shareMenu) shareMenu.classList.add('hidden');
        }
    });

    // --- Historique navigateur ---
    window.addEventListener('popstate', function() {
        var hash = window.location.hash.substring(1);
        showTab(hash || 'presentation');
    });

    // --- Init: charger le bon onglet ---
    var hash = window.location.hash.substring(1);
    if (hash) {
        showTab(hash);
    }

    console.log('✅ Profil.js chargé avec succès');
});