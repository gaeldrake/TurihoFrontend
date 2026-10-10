        (function () {
            "use strict";

            var btn = document.getElementById("togglePasswordBtn");
            var input = document.getElementById("admin-password");
            var icon = document.getElementById("eyeIcon");
            var form = document.querySelector("form");
            var submitBtn = document.getElementById("login-submit");

            // Password visibility toggle
            if (btn && input && icon) {
                btn.addEventListener("click", function () {
                    var isPassword = input.type === "password";
                    input.type = isPassword ? "text" : "password";
                    icon.classList.toggle("fa-eye", !isPassword);
                    icon.classList.toggle("fa-eye-slash", isPassword);
                    btn.setAttribute("aria-pressed", isPassword ? "true" : "false");
                    btn.setAttribute(
                        "aria-label",
                        isPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
                    );
                });
            }

            // Prevent double submission
            if (form && submitBtn) {
                form.addEventListener("submit", function () {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML =
                        '<i class="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>Connexion…';
                    // Re-enable after timeout in case of network issues
                    setTimeout(function () {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML =
                            '<i class="fas fa-right-to-bracket mr-2" aria-hidden="true"></i>Se connecter';
                    }, 10000);
                });
            }
        })();