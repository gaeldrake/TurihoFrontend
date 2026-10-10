    (function () {
        "use strict";

        document.addEventListener("DOMContentLoaded", function () {
            var form = document.getElementById("activity-form");
            var submitBtn = document.getElementById("submit-btn");
            var imageInput = document.getElementById("image");

            // ——— FIX 14: Image preview ———
            // Original had no preview — user couldn't verify their selection
            // before a potentially slow upload.
            if (imageInput) {
                imageInput.addEventListener("change", function () {
                    // Remove existing preview
                    var existing = document.getElementById("image-preview");
                    if (existing) existing.remove();

                    var file = imageInput.files[0];
                    if (!file) return;

                    // FIX 15: Client-side file size validation.
                    // Backend may reject large files, but the user would wait
                    // through the entire upload before seeing an error.
                    var maxSize = 5 * 1024 * 1024; // 5 MB
                    if (file.size > maxSize) {
                        showFieldError(
                            imageInput,
                            "Le fichier est trop volumineux (max 5 Mo)."
                        );
                        imageInput.value = "";
                        return;
                    }

                    // FIX 16: Validate file type client-side as well
                    var allowedTypes = [
                        "image/jpeg", "image/png", "image/gif", "image/webp"
                    ];
                    if (allowedTypes.indexOf(file.type) === -1) {
                        showFieldError(
                            imageInput,
                            "Format non accepté. Utilisez JPG, PNG, GIF ou WebP."
                        );
                        imageInput.value = "";
                        return;
                    }

                    clearFieldError(imageInput);

                    // Show preview
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var preview = document.createElement("img");
                        preview.id = "image-preview";
                        preview.src = e.target.result;
                        preview.alt = "Aperçu de l'image sélectionnée";
                        preview.className =
                            "mt-3 max-w-xs h-40 object-cover rounded-lg " +
                            "border-2 border-gray-200";
                        imageInput.parentNode.appendChild(preview);
                    };
                    reader.readAsDataURL(file);
                });
            }

            // ——— FIX 17: Prevent double submission ———
            // Original had no protection — clicking "Ajouter" twice quickly
            // creates duplicate activities.
            if (form && submitBtn) {
                form.addEventListener("submit", function () {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML =
                        '<i class="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>' +
                        "Ajout en cours…";

                    // Safety fallback — re-enable after 10s
                    setTimeout(function () {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML =
                            '<i class="fas fa-plus mr-2" aria-hidden="true"></i>' +
                            "Ajouter l'activité";
                    }, 10000);
                });
            }

            // ——— FIX 18: Character counter for description ———
            // Without this, users have no idea they're approaching the 2000
            // character limit until the browser blocks further input.
            var descField = document.getElementById("description");
            var descHelp = document.getElementById("desc-help");
            if (descField && descHelp) {
                descField.addEventListener("input", function () {
                    var remaining = 2000 - descField.value.length;
                    if (remaining < 200) {
                        descHelp.textContent = remaining + " caractères restants.";
                        descHelp.classList.toggle("text-red-500", remaining < 50);
                        descHelp.classList.toggle("text-yellow-600",
                            remaining >= 50 && remaining < 200);
                        descHelp.classList.toggle("text-gray-500", remaining >= 200);
                    } else {
                        descHelp.textContent = "Maximum 2000 caractères.";
                        descHelp.className = "mt-1 text-xs text-gray-500";
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