    (function () {
        "use strict";

        document.addEventListener("DOMContentLoaded", function () {
            var form = document.getElementById("event-form");
            var submitBtn = document.getElementById("submit-btn");
            var dateDebut = document.getElementById("date_debut");
            var dateFin = document.getElementById("date_fin");
            var imageInput = document.getElementById("image");

            // ——— FIX 20: Date end must be after date start ———
            // The backend validates this but shows a flash message after a
            // full page reload + data loss. Client-side validation prevents
            // the frustrating round-trip.
            if (dateDebut && dateFin) {
                dateDebut.addEventListener("change", function () {
                    // Set the min of date_fin to whatever date_debut is
                    if (dateDebut.value) {
                        dateFin.min = dateDebut.value;

                        // If current date_fin is before new date_debut, clear it
                        if (dateFin.value && dateFin.value < dateDebut.value) {
                            dateFin.value = "";
                            showFieldError(
                                dateFin,
                                "La date de fin a été réinitialisée car elle était avant la date de début."
                            );
                        }
                    }
                });

                dateFin.addEventListener("change", function () {
                    clearFieldError(dateFin);
                    if (dateDebut.value && dateFin.value) {
                        if (dateFin.value < dateDebut.value) {
                            showFieldError(
                                dateFin,
                                "La date de fin doit être après la date de début."
                            );
                        }
                    }
                });
            }

            // ——— FIX 21: Form-level validation before submit ———
            // Catches all client-side issues at once instead of one-by-one
            if (form) {
                form.addEventListener("submit", function (e) {
                    var hasError = false;

                    // Validate date relationship
                    if (dateDebut && dateFin &&
                        dateDebut.value && dateFin.value &&
                        dateFin.value < dateDebut.value) {
                        e.preventDefault();
                        showFieldError(
                            dateFin,
                            "La date de fin doit être après la date de début."
                        );
                        hasError = true;
                    }

                    // Prevent double submission
                    if (!hasError && submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.innerHTML =
                            '<i class="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>' +
                            'Ajout en cours…';

                        setTimeout(function () {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML =
                                '<i class="fas fa-calendar-plus mr-2" aria-hidden="true"></i>' +
                                "Ajouter l'événement";
                        }, 10000);
                    }
                });
            }

            // ——— FIX 22: Image preview + validation ———
            if (imageInput) {
                imageInput.addEventListener("change", function () {
                    var existing = document.getElementById("image-preview");
                    if (existing) existing.remove();
                    clearFieldError(imageInput);

                    var file = imageInput.files[0];
                    if (!file) return;

                    // File size check
                    var maxSize = 5 * 1024 * 1024;
                    if (file.size > maxSize) {
                        showFieldError(
                            imageInput,
                            "Fichier trop volumineux (max 5 Mo)."
                        );
                        imageInput.value = "";
                        return;
                    }

                    // File type check
                    var allowed = [
                        "image/jpeg", "image/png", "image/gif", "image/webp"
                    ];
                    if (allowed.indexOf(file.type) === -1) {
                        showFieldError(
                            imageInput,
                            "Format non accepté. Utilisez JPG, PNG, GIF ou WebP."
                        );
                        imageInput.value = "";
                        return;
                    }

                    // Preview
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var img = document.createElement("img");
                        img.id = "image-preview";
                        img.src = e.target.result;
                        img.alt = "Aperçu de l'image sélectionnée";
                        img.className =
                            "mt-3 max-w-full h-48 object-cover rounded-lg " +
                            "border-2 border-gray-200";
                        imageInput.parentNode.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                });
            }

            // ——— FIX 23: Character counter for description ———
            var descField = document.getElementById("description");
            var descHelp = document.getElementById("desc-help");
            if (descField && descHelp) {
                descField.addEventListener("input", function () {
                    var remaining = 3000 - descField.value.length;
                    if (remaining < 300) {
                        descHelp.textContent = remaining + " caractères restants.";
                        descHelp.classList.remove("text-gray-500", "text-yellow-600", "text-red-500");
                        if (remaining < 50) {
                            descHelp.classList.add("text-red-500");
                        } else {
                            descHelp.classList.add("text-yellow-600");
                        }
                    } else {
                        descHelp.textContent = "Maximum 3000 caractères.";
                        descHelp.classList.remove("text-yellow-600", "text-red-500");
                        descHelp.classList.add("text-gray-500");
                    }
                });
            }

            // ——— Helpers ———
            function showFieldError(input, message) {
                clearFieldError(input);
                var errorEl = document.createElement("p");
                errorEl.className = "mt-1 text-xs text-red-600 field-error";
                errorEl.setAttribute("role", "alert");
                errorEl.textContent = message;
                input.parentNode.appendChild(errorEl);
                input.classList.add("border-red-500");
                input.setAttribute("aria-invalid", "true");
            }

            function clearFieldError(input) {
                var parent = input.parentNode;
                var errors = parent.querySelectorAll(".field-error");
                errors.forEach(function (el) { el.remove(); });
                input.classList.remove("border-red-500");
                input.removeAttribute("aria-invalid");
            }
        });
    })();