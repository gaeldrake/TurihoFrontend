(function () {
    "use strict";

    // --- Password visibility toggles ---
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

    // --- Client-side password match validation ---
    const password = document.getElementById("reset-password");
    const confirm  = document.getElementById("reset-confirm-password");

    if (password && confirm) {
        function checkMatch() {
            if (confirm.value && confirm.value !== password.value) {
                confirm.setCustomValidity(
                    "Les mots de passe ne correspondent pas."
                );
            } else {
                confirm.setCustomValidity("");
            }
        }
        confirm.addEventListener("input", checkMatch);
        password.addEventListener("input", checkMatch);
        // ← both fields trigger revalidation
    }

    // --- Double-submit prevention ---
    const form = document.getElementById("reset-form");
    const submitBtn = document.getElementById("resetSubmitBtn");

    if (form && submitBtn) {
        form.addEventListener("submit", function () {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<i class="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>'
                + "Mise à jour…";
        });
    }
})();