/**
 * Navbar — Menu mobile + Dropdown utilisateur
 */
(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initUserDropdown();
        initResizeHandler();
    });


    // ════════════════════════════════
    //  MENU MOBILE
    // ════════════════════════════════

    function initMobileMenu() {
        var btn = document.getElementById("mobile-menu-btn");
        var menu = document.getElementById("mobile-menu");
        var icon = document.getElementById("mobile-menu-icon");

        if (!btn || !menu) return;

        btn.addEventListener("click", function () {
            var isOpen = !menu.classList.contains("hidden");

            // Toggle menu
            menu.classList.toggle("hidden");

            // Mettre à jour aria
            btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
            btn.setAttribute(
                "aria-label",
                isOpen ? "Ouvrir le menu de navigation" : "Fermer le menu de navigation"
            );

            // Icône
            if (icon) {
                icon.className = isOpen
                    ? "fas fa-bars text-xl"
                    : "fas fa-times text-xl";
            }

            // Bloquer le scroll quand ouvert
            document.body.style.overflow = isOpen ? "" : "hidden";

            // Focus le premier lien si on ouvre
            if (!isOpen) {
                var firstLink = menu.querySelector("a");
                if (firstLink) firstLink.focus();
            }
        });

        // Fermer avec Escape
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && !menu.classList.contains("hidden")) {
                closeMenu(btn, menu, icon);
            }
        });

        // Fermer si clic en dehors
        document.addEventListener("click", function (e) {
            if (
                !menu.classList.contains("hidden") &&
                !menu.contains(e.target) &&
                !btn.contains(e.target)
            ) {
                closeMenu(btn, menu, icon);
            }
        });
    }

    function closeMenu(btn, menu, icon) {
        menu.classList.add("hidden");
        btn.setAttribute("aria-expanded", "false");
        btn.setAttribute("aria-label", "Ouvrir le menu de navigation");
        if (icon) icon.className = "fas fa-bars text-xl";
        document.body.style.overflow = "";
        btn.focus();
    }


    // ════════════════════════════════
    //  DROPDOWN UTILISATEUR
    // ════════════════════════════════

    function initUserDropdown() {
        var btn = document.getElementById("user-menu-btn");
        var dropdown = document.getElementById("user-dropdown");
        var arrow = document.getElementById("user-menu-arrow");

        if (!btn || !dropdown) return;

        // Toggle
        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            var isOpen = !dropdown.classList.contains("hidden");
            toggleDropdown(!isOpen);
        });

        // Fermer au clic extérieur
        document.addEventListener("click", function (e) {
            if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
                toggleDropdown(false);
            }
        });

        // Fermer avec Escape
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && !dropdown.classList.contains("hidden")) {
                toggleDropdown(false);
                btn.focus();
            }
        });

        // Navigation clavier dans le dropdown
        dropdown.addEventListener("keydown", function (e) {
            var items = dropdown.querySelectorAll('[role="menuitem"]');
            var currentIndex = Array.prototype.indexOf.call(items, document.activeElement);

            if (e.key === "ArrowDown") {
                e.preventDefault();
                var nextIndex = (currentIndex + 1) % items.length;
                items[nextIndex].focus();
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                var prevIndex = (currentIndex - 1 + items.length) % items.length;
                items[prevIndex].focus();
            } else if (e.key === "Home") {
                e.preventDefault();
                items[0].focus();
            } else if (e.key === "End") {
                e.preventDefault();
                items[items.length - 1].focus();
            }
        });

        function toggleDropdown(open) {
            if (open) {
                dropdown.classList.remove("hidden");
                btn.setAttribute("aria-expanded", "true");
                if (arrow) arrow.style.transform = "rotate(180deg)";

                // Focus premier item
                var firstItem = dropdown.querySelector('[role="menuitem"]');
                if (firstItem) firstItem.focus();
            } else {
                dropdown.classList.add("hidden");
                btn.setAttribute("aria-expanded", "false");
                if (arrow) arrow.style.transform = "";
            }
        }
    }


    // ════════════════════════════════
    //  RESIZE HANDLER
    // ════════════════════════════════

    function initResizeHandler() {
        var mobileMenu = document.getElementById("mobile-menu");
        var mobileBtn = document.getElementById("mobile-menu-btn");
        var mobileIcon = document.getElementById("mobile-menu-icon");
        var resizeTimer = null;

        window.addEventListener("resize", function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                if (window.innerWidth >= 1024 && mobileMenu) {
                    closeMenu(mobileBtn, mobileMenu, mobileIcon);
                }
            }, 150);
        });
    }
})();