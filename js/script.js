/**
 * index.js — Logique de la page d'accueil
 * Fichier externe pour respecter la CSP
 */

(function () {
    "use strict";

    // ════════════════════════════════
    // INITIALISATION
    // ════════════════════════════════
    document.addEventListener("DOMContentLoaded", function () {
        initCounters();
        initTypeFilters();
        initNewsletter();
        initEventModals();
        console.log("✅ index.js chargé avec succès");
    });


    // ════════════════════════════════
    // UTILITAIRES
    // ════════════════════════════════

    function escapeHtml(text) {
        var div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    function getAppUrl(key) {
        var el = document.getElementById("app-urls");
        if (el) {
            return el.getAttribute("data-" + key) || "";
        }
        return "";
    }

    /**
     * Récupère le token CSRF depuis la meta tag
     * Nécessaire pour les requêtes POST (newsletter, etc.)
     */
    function getCsrfToken() {
        var meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.getAttribute("content") : "";
    }


    // ════════════════════════════════
    // COMPTEURS ANIMÉS
    // ════════════════════════════════

    function initCounters() {
        var counters = document.querySelectorAll(".counter");
        if (!counters.length) return;

        var prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        counters.forEach(function (counter) {
            var target = parseInt(counter.getAttribute("data-target"), 10) || 0;

            if (prefersReduced) {
                counter.textContent = target;
                return;
            }

            var duration = 2000;
            var startTime = null;
            var hasStarted = false;

            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                var progress = Math.min((timestamp - startTime) / duration, 1);
                // Easing cubique (ease-out)
                var eased = 1 - Math.pow(1 - progress, 3);
                counter.textContent = Math.floor(eased * target);
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    counter.textContent = target;
                }
            }

            if ("IntersectionObserver" in window) {
                var observer = new IntersectionObserver(
                    function (entries) {
                        entries.forEach(function (entry) {
                            if (entry.isIntersecting && !hasStarted) {
                                hasStarted = true;
                                requestAnimationFrame(step);
                                observer.unobserve(entry.target);
                            }
                        });
                    },
                    { threshold: 0.3 }
                );
                observer.observe(counter);
            } else {
                // Fallback pour les vieux navigateurs
                requestAnimationFrame(step);
            }
        });
    }


    // ════════════════════════════════
    // FILTRES PAR TYPE
    // ════════════════════════════════

    function initTypeFilters() {
        var buttons = document.querySelectorAll(".type-filter-btn");
        var grid = document.getElementById("organizationsGrid");
        if (!grid || !buttons.length) return;

        var activeType = null;
        var currentController = null;

        buttons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                var type = btn.getAttribute("data-type");

                // Toggle : recliquer désactive
                if (activeType === type) {
                    activeType = null;
                } else {
                    activeType = type;
                }

                // Mise à jour visuelle des boutons
                buttons.forEach(function (b) {
                    var isActive = b.getAttribute("data-type") === activeType;
                    b.setAttribute("aria-pressed", isActive ? "true" : "false");
                    b.classList.toggle("ring-2", isActive);
                    b.classList.toggle("ring-offset-1", isActive);
                    b.classList.toggle("shadow-md", isActive);
                });

                // Annuler requête précédente si en cours
                if (currentController) {
                    currentController.abort();
                }

                // Vérifier que AbortController est disponible
                if ("AbortController" in window) {
                    currentController = new AbortController();
                }

                // Construire l'URL
                var url = getAppUrl("ajax-search");
                if (!url) {
                    console.warn("URL ajax-search non trouvée");
                    return;
                }
                if (activeType) {
                    url += (url.indexOf("?") !== -1 ? "&" : "?") +
                           "type=" + encodeURIComponent(activeType);
                }

                // État de chargement
                grid.setAttribute("aria-busy", "true");
                grid.style.opacity = "0.4";
                grid.style.pointerEvents = "none";

                var fetchOptions = {
                    headers: { "X-Requested-With": "XMLHttpRequest" },
                };

                // Ajouter le signal d'annulation si disponible
                if (currentController) {
                    fetchOptions.signal = currentController.signal;
                }

                fetch(url, fetchOptions)
                    .then(function (response) {
                        if (!response.ok) {
                            throw new Error("HTTP " + response.status);
                        }
                        return response.text();
                    })
                    .then(function (html) {
                        grid.innerHTML = html;
                        currentController = null;

                        // Réinitialiser les modals événements dans le nouveau contenu
                        initEventModals();
                    })
                    .catch(function (err) {
                        if (err.name === "AbortError") return;
                        console.error("Erreur filtre :", err);
                        currentController = null;

                        grid.innerHTML =
                            '<div class="col-span-full text-center py-12">' +
                                '<i class="fas fa-exclamation-triangle text-3xl text-red-400 mb-3" aria-hidden="true"></i>' +
                                '<p class="text-gray-600">Erreur de chargement.</p>' +
                                '<button class="mt-3 text-green-600 hover:text-green-700 font-medium" ' +
                                    'onclick="location.reload()">' +
                                    '<i class="fas fa-redo mr-1"></i> Réessayer' +
                                '</button>' +
                            '</div>';
                    })
                    .finally(function () {
                        grid.style.opacity = "1";
                        grid.style.pointerEvents = "";
                        grid.setAttribute("aria-busy", "false");
                    });
            });
        });
    }


    // ════════════════════════════════
    // MODALS ÉVÉNEMENTS
    // ════════════════════════════════

    function initEventModals() {
        var eventCards = document.querySelectorAll("[data-event-modal]");
        if (!eventCards.length) return;

        // Stocker la référence de l'élément qui a ouvert le modal
        var lastFocusedElement = null;

        eventCards.forEach(function (card) {
            var modalId = card.getAttribute("data-event-modal");
            var modal = document.getElementById(modalId);
            if (!modal) return;

            var closeBtns = modal.querySelectorAll("[data-close-modal]");

            // Ouvrir au clic
            card.addEventListener("click", function () {
                lastFocusedElement = card;
                openModal(modal);
            });

            // Ouvrir au clavier (Enter ou Space)
            card.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    lastFocusedElement = card;
                    openModal(modal);
                }
            });

            // Fermer avec les boutons
            closeBtns.forEach(function (btn) {
                btn.addEventListener("click", function (e) {
                    e.stopPropagation();
                    closeModal(modal, lastFocusedElement);
                });
            });

            // Fermer en cliquant sur l'overlay
            modal.addEventListener("click", function (e) {
                if (e.target === modal) {
                    closeModal(modal, lastFocusedElement);
                }
            });
        });

        // Fermer avec Échap (une seule fois, pas dans la boucle)
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                var openModals = document.querySelectorAll(".event-modal.active");
                openModals.forEach(function (modal) {
                    closeModal(modal, lastFocusedElement);
                });
            }
        });
    }

    function openModal(modal) {
        if (!modal) return;

        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";

        // Forcer le reflow avant d'ajouter la classe active
        modal.offsetHeight;
        modal.classList.add("active");

        // Animation du contenu
        requestAnimationFrame(function () {
            modal.style.opacity = "1";
            var content = modal.querySelector(".modal-content");
            if (content) {
                content.style.transform = "scale(1)";
                content.style.opacity = "1";
            }
        });

        // Focus sur le premier élément focusable
        requestAnimationFrame(function () {
            var focusable = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length) {
                focusable[0].focus();
            }
        });
    }

    function closeModal(modal, returnFocus) {
        if (!modal) return;

        var content = modal.querySelector(".modal-content");
        if (content) {
            content.style.transform = "scale(0.95)";
            content.style.opacity = "0";
        }
        modal.style.opacity = "0";

        setTimeout(function () {
            modal.classList.add("hidden");
            modal.classList.remove("active");
            document.body.style.overflow = "";

            // Restaurer le focus sur l'élément d'origine
            if (returnFocus && typeof returnFocus.focus === "function") {
                returnFocus.focus();
            }
        }, 200);
    }


    // ════════════════════════════════
    // NEWSLETTER
    // ════════════════════════════════

    function initNewsletter() {
        var form = document.getElementById("newsletterForm");
        var msgDiv = document.getElementById("newsletterMessage");
        var btn = document.getElementById("btn-newsletter");
        if (!form || !btn) return;

        // Sauvegarder le HTML original du bouton
        var originalBtnHtml = btn.innerHTML;

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            var email = form.querySelector("#newsletter-email");
            var consent = form.querySelector("#newsletter-consent");

            // ── Validation ──
            if (!email || !email.value.trim()) {
                showMsg(msgDiv, "Veuillez entrer votre email.", "error");
                if (email) email.focus();
                return;
            }

            if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                showMsg(msgDiv, "Veuillez entrer un email valide.", "error");
                email.focus();
                return;
            }

            if (consent && !consent.checked) {
                showMsg(msgDiv, "Veuillez accepter les conditions.", "error");
                consent.focus();
                return;
            }

            // ── URL ──
            var url = getAppUrl("newsletter");
            if (!url) {
                showMsg(msgDiv, "Configuration erreur. Contactez l'administrateur.", "error");
                console.error("URL newsletter non trouvée dans #app-urls");
                return;
            }

            // ── État de chargement ──
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i> Envoi…';

            // ── Envoi ──
            var formData = new FormData(form);

            // Ajouter le CSRF token si pas déjà dans le formulaire
            var csrfToken = getCsrfToken();
            if (csrfToken && !formData.has("csrf_token")) {
                formData.append("csrf_token", csrfToken);
            }

            fetch(url, {
                method: "POST",
                body: formData,
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            })
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error("HTTP " + response.status);
                    }
                    return response.json();
                })
                .then(function (data) {
                    if (data.status === "success") {
                        showMsg(msgDiv, data.message || "Inscription réussie !", "success");
                        form.reset();
                    } else {
                        showMsg(
                            msgDiv,
                            data.message || "Une erreur est survenue.",
                            "error"
                        );
                    }
                })
                .catch(function (err) {
                    console.error("Newsletter error:", err);
                    showMsg(
                        msgDiv,
                        "Erreur réseau. Veuillez réessayer.",
                        "error"
                    );
                })
                .finally(function () {
                    btn.disabled = false;
                    btn.innerHTML = originalBtnHtml;
                });
        });
    }

    /**
     * Affiche un message de feedback
     * @param {HTMLElement} el - Conteneur du message
     * @param {string} message - Texte à afficher
     * @param {string} type - "success" ou "error"
     */
    function showMsg(el, message, type) {
        if (!el) return;

        // Nettoyer les classes précédentes
        el.classList.remove("hidden", "text-green-600", "text-red-600",
                           "bg-green-50", "bg-red-50");

        // Appliquer les nouvelles classes
        if (type === "success") {
            el.classList.add("text-green-600", "bg-green-50");
        } else {
            el.classList.add("text-red-600", "bg-red-50");
        }

        var icon = type === "success" ? "fa-check-circle" : "fa-exclamation-circle";
        el.innerHTML =
            '<i class="fas ' + icon + ' mr-1" aria-hidden="true"></i> ' +
            escapeHtml(message);

        // Ajouter un padding et un border radius
        el.style.padding = "0.5rem 1rem";
        el.style.borderRadius = "0.5rem";

        // Role alert pour les lecteurs d'écran
        el.setAttribute("role", "alert");

        // Auto-hide après 6 secondes
        setTimeout(function () {
            el.classList.add("hidden");
            el.removeAttribute("role");
        }, 6000);
    }

})();