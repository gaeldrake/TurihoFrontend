/**
 * base.js — Scripts globaux chargés sur toutes les pages
 * Remplace le script inline de base.html
 */

(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        initAOS();
        initFlashMessages();
        console.log("✅ base.js chargé");
    });

    // ════════════════════════════════
    // AOS (Animate On Scroll)
    // ════════════════════════════════

    function initAOS() {
        try {
            if (typeof AOS !== "undefined" && AOS.init) {
                AOS.init({
                    duration: 600,
                    once: true,
                    easing: "ease-out",
                    disable: window.matchMedia(
                        "(prefers-reduced-motion: reduce)"
                    ).matches,
                });
            }
        } catch (e) {
            console.warn("AOS init failed:", e);
        }
    }

    // ════════════════════════════════
    // FLASH MESSAGES
    // ════════════════════════════════

    function initFlashMessages() {
        var container = document.getElementById("flash-container");
        if (!container) return;

        var prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        // Boutons de fermeture manuelle
        container.querySelectorAll(".flash-dismiss").forEach(function (btn) {
            btn.addEventListener("click", function () {
                dismissFlash(
                    btn.closest(".flash-message"),
                    prefersReduced
                );
            });
        });

        // Auto-dismiss
        container
            .querySelectorAll(".flash-message")
            .forEach(function (msg) {
                var delay =
                    parseInt(msg.dataset.autoDismiss, 10) || 5000;

                var timer = setTimeout(function () {
                    dismissFlash(msg, prefersReduced);
                }, delay);

                // Pause on hover
                msg.addEventListener("mouseenter", function () {
                    clearTimeout(timer);
                });

                msg.addEventListener("mouseleave", function () {
                    timer = setTimeout(function () {
                        dismissFlash(msg, prefersReduced);
                    }, delay);
                });

                // Pause on focus
                msg.addEventListener("focusin", function () {
                    clearTimeout(timer);
                });

                msg.addEventListener("focusout", function () {
                    timer = setTimeout(function () {
                        dismissFlash(msg, prefersReduced);
                    }, delay);
                });
            });
    }

    function dismissFlash(msg, prefersReduced) {
        if (!msg || !msg.parentNode) return;

        msg.setAttribute("aria-hidden", "true");

        if (prefersReduced) {
            msg.remove();
            cleanupFlashContainer();
            return;
        }

        msg.style.opacity = "0";
        msg.style.transform = "translateX(20px)";

        var removed = false;
        function removeOnce() {
            if (removed) return;
            removed = true;
            msg.remove();
            cleanupFlashContainer();
        }

        msg.addEventListener("transitionend", removeOnce, { once: true });
        setTimeout(removeOnce, 400);
    }

    function cleanupFlashContainer() {
        var container = document.getElementById("flash-container");
        if (container && container.children.length === 0) {
            container.remove();
        }
    }
})();