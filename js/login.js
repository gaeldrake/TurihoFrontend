(function () {
    "use strict";

    // --- Password visibility toggle ---
    const btn   = document.getElementById("togglePasswordBtn");
    const input = document.getElementById("login-password");
    const icon  = document.getElementById("eyeIcon");

    if (btn && input && icon) {
        btn.addEventListener("click", function () {
            const showing = input.type === "password";
            input.type = showing ? "text" : "password";

            icon.classList.toggle("fa-eye",       !showing);
            icon.classList.toggle("fa-eye-slash",  showing);

            btn.setAttribute("aria-pressed", String(showing));
            btn.setAttribute(
                "aria-label",
                showing ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
            );
        });
    }

    // --- Double-submit prevention ---
    const form = document.querySelector("form");
    const submitBtn = document.getElementById("loginSubmitBtn");

    if (form && submitBtn) {
        form.addEventListener("submit", function () {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<i class="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>'
                + "Connexion…";
        });
    }
})();
