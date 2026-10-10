    (function () {
        "use strict";

        document.addEventListener("DOMContentLoaded", function () {
            var form = document.getElementById("edit-event-form");
            var submitBtn = document.getElementById("submit-btn");
            var dateDebut = document.getElementById("date_debut");
            var dateFin = document.getElementById("date_fin");
            var imageInput = document.getElementById("image");

            // ——— Unsaved changes warning ———
            var formChanged = false;
            if (form) {
                form.addEventListener("input", function () { formChanged = true; });
                form.addEventListener("change", function () { formChanged = true; });
                form.addEventListener("submit", function () { formChanged = false; });
            }
            window.addEventListener("beforeunload", function (e) {
                if (formChanged) {
                    e.preventDefault();
                    e.returnValue = "";
                }
            });

            // ——— Date validation ———
            if (dateDebut && dateFin) {
                dateDebut.addEventListener("change", function () {
                    if (dateDebut.value) {
                        dateFin.min = dateDebut.value;
                        if (dateFin.value && dateFin.value < dateDebut.value) {
                            dateFin.value = "";
                            showFieldError(
                                dateFin,
                                "Date de fin réinitialisée (était avant la date de début)."
                            );
                        }
                    }
                });

                dateFin.addEventListener("change", function () {
                    clearFieldError(dateFin);
                    if (dateDebut.value && dateFin.value &&
                        dateFin.value < dateDebut.value) {
                        showFieldError(
                            dateFin,
                            "La date de fin doit être après la date de début."
                        );
                    }
                });

                // Set initial min constraint
                if (dateDebut.value) {
                    dateFin.min = dateDebut.value;
                }
            }

            // ——— Image preview + validation ———
            if (imageInput) {
                imageInput.addEventListener("change", function () {
                    var existing = document.getElementById("new-image-preview");
                    if (existing) existing.remove();
                    clearFieldError(imageInput);

                    var file = imageInput.files[0];
                    if (!file) return;

                    var maxSize = 5 * 1024 * 1024;
                    if (file.size > maxSize) {
                        showFieldError(imageInput, "Fichier trop volumineux (max 5 Mo).");
                        imageInput.value = "";
                        return;
                    }

                    var allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
                    if (allowed.indexOf(file.type) === -1) {
                        showFieldError(imageInput, "Format non accepté.");
                        imageInput.value = "";
                        return;
                    }

                    // Dim current image, show new preview
                    var currentContainer = document.getElementById("current-image-container");
                    if (currentContainer) {
                        currentContainer.style.opacity = "0.4";
                    }

                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var preview = document.createElement("div");
                        preview.id = "new-image-preview";
                        preview.className = "mt-3 flex items-center gap-3";
                        preview.innerHTML =
                            '<img src="' + e.target.result + '" ' +
                            'alt="Aperçu de la nouvelle image" ' +
                            'class="w-40 h-28 object-cover rounded-lg border-2 border-blue-400">' +
                            '<span class="text-sm text-blue-600 font-medium">' +
                            'Nouvelle image (non enregistrée)</span>';
                        imageInput.parentNode.appendChild(preview);
                    };
                    reader.readAsDataURL(file);
                });
            }

            // ——— Prevent double submission ———
            if (form && submitBtn) {
                form.addEventListener("submit", function (e) {
                    // Validate dates before submit
                    if (dateDebut && dateFin &&
                        dateDebut.value && dateFin.value &&
                        dateFin.value < dateDebut.value) {
                        e.preventDefault();
                        showFieldError(dateFin, "La date de fin doit être après la date de début.");
                        return;
                    }

                    submitBtn.disabled = true;
                    submitBtn.innerHTML =
                        '<i class="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>' +
                        "Enregistrement…";

                    setTimeout(function () {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML =
                            '<i class="fas fa-save mr-2" aria-hidden="true"></i>' +
                            "Enregistrer les modifications";
                    }, 10000);
                });
            }

            // ——— Description character counter ———
            var descField = document.getElementById("description");
            var descHelp = document.getElementById("desc-help");
            if (descField && descHelp) {
                updateCounter();
                descField.addEventListener("input", updateCounter);

                function updateCounter() {
                    var remaining = 3000 - descField.value.length;
                    if (remaining < 300) {
                        descHelp.textContent = remaining + " caractères restants.";
                        descHelp.classList.remove("text-gray-500", "text-yellow-600", "text-red-500");
                        descHelp.classList.add(remaining < 50 ? "text-red-500" : "text-yellow-600");
                    } else {
                        descHelp.textContent = "Maximum 3000 caractères.";
                        descHelp.className = "mt-1 text-xs text-gray-500";
                    }
                }
            }

            // ——— Helpers ———
            function showFieldError(input, message) {
                clearFieldError(input);
                var el = document.createElement("p");
                el.className = "mt-1 text-xs text-red-600 field-error";
                el.setAttribute("role", "alert");
                el.textContent = message;
                input.parentNode.appendChild(el);
                input.classList.add("border-red-500");
                input.setAttribute("aria-invalid", "true");
            }

            function clearFieldError(input) {
                var parent = input.parentNode;
                parent.querySelectorAll(".field-error").forEach(function (el) { el.remove(); });
                input.classList.remove("border-red-500");
                input.removeAttribute("aria-invalid");
            }
        });
    })();