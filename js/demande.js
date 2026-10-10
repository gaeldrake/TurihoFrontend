(function () {
    "use strict";

    // --- Double-submit prevention ---
    const form = document.getElementById("demande-form");
    const submitBtn = document.getElementById("demandeSubmitBtn");

    if (form && submitBtn) {
        form.addEventListener("submit", function () {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<i class="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>'
                + "Envoi en cours…";
        });
    }
})();