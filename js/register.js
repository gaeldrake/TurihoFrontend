// ============================================
//  TOGGLE MOT DE PASSE
// ============================================

(function () {
    "use strict";

    // --- Password toggle (CSP-safe, no inline onclick) ---
    document.querySelectorAll(".password-toggle").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const targetId = btn.getAttribute("data-target");
            const input = document.getElementById(targetId);
            const icon = btn.querySelector("i");
            if (!input || !icon) return;

            const showing = input.type === "password";
            input.type = showing ? "text" : "password";

            icon.classList.toggle("fa-eye", !showing);
            icon.classList.toggle("fa-eye-slash", showing);

            btn.setAttribute("aria-pressed", String(showing));
            btn.setAttribute(
                "aria-label",
                showing ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
            );
        });
    });

    // --- Client-side password match check ---
    const password = document.getElementById("register-password");
    const confirm  = document.getElementById("register-confirm-password");

    if (confirm && password) {
        confirm.addEventListener("input", function () {
            if (confirm.value && confirm.value !== password.value) {
                confirm.setCustomValidity(
                    "Les mots de passe ne correspondent pas."
                );
            } else {
                confirm.setCustomValidity("");
            }
        });
    }

    // --- Double-submit prevention ---
    const form = document.getElementById("register-form");
    const submitBtn = document.getElementById("registerSubmitBtn");

    if (form && submitBtn) {
        form.addEventListener("submit", function () {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<i class="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>'
                + "Création en cours…";
        });
    }
})();


// ============================================
//  CATÉGORIES PAR TYPE D'ORGANISATION
// ============================================

const categories = {
    association: [
        "Sociale & Humanitaire",
        "Culturelle",
        "Éducative",
        "Environnementale",
        "Sportive & Loisirs",
        "Professionnelle",
        "Religieuse & Spirituelle"
    ],
    cooperative: [
        "Agricole",
        "Artisanale",
        "Pêche & Aquaculture",
        "Consommation",
        "Services",
        "Habitat",
        "Jeunes & Femmes"
    ],
    company: [
        "Technologie",          // ✅ Virgule corrigée
        "Commerciale",
        "Industrielle",
        "Services",
        "Financière",
        "Agroalimentaire",
        "Tourisme & Hôtellerie",
        "Immobilier & BTP",
        "Éducation & Formation"
    ]
};


// ============================================
//  SÉLECTION DYNAMIQUE DES CATÉGORIES
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    const typeSelect = document.getElementById("register-org-type");
    const categorySelect = document.getElementById("register-org-category");

    if (!typeSelect || !categorySelect) return;

    typeSelect.addEventListener("change", function () {
        const type = this.value;

        // Réinitialiser le select catégorie
        categorySelect.innerHTML =
            '<option value="" disabled selected>Sélectionnez la catégorie</option>';

        // Remplir avec les catégories correspondantes
        if (categories[type]) {
            categories[type].forEach(cat => {
                const option = document.createElement("option");
                option.value = cat;
                option.textContent = cat;
                categorySelect.appendChild(option);
            });
        }
    });
});