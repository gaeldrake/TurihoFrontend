    (function () {
        "use strict";

        document.addEventListener("DOMContentLoaded", function () {
            var form = document.getElementById("edit-member-form");
            var submitBtn = document.getElementById("submit-btn");
            var photoInput = document.getElementById("photo");

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

            // ——— Photo preview + validation ———
            if (photoInput) {
                photoInput.addEventListener("change", function () {
                    var existing = document.getElementById("new-photo-preview");
                    if (existing) existing.remove();
                    clearFieldError(photoInput);

                    var file = photoInput.files[0];
                    if (!file) return;

                    // File size check
                    var maxSize = 5 * 1024 * 1024;
                    if (file.size > maxSize) {
                        showFieldError(
                            photoInput,
                            "Fichier trop volumineux (max 5 Mo)."
                        );
                        photoInput.value = "";
                        return;
                    }

                    // File type check
                    var allowed = [
                        "image/jpeg", "image/png", "image/gif", "image/webp"
                    ];
                    if (allowed.indexOf(file.type) === -1) {
                        showFieldError(
                            photoInput,
                            "Format non accepté. Utilisez JPG, PNG, GIF ou WebP."
                        );
                        photoInput.value = "";
                        return;
                    }

                    // Dim current photo, show new preview
                    var currentContainer =
                        document.getElementById("current-photo-container");
                    if (currentContainer) {
                        currentContainer.style.opacity = "0.4";
                    }

                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var preview = document.createElement("div");
                        preview.id = "new-photo-preview";
                        preview.className = "mt-3 flex items-center gap-3";
                        preview.innerHTML =
                            '<img src="' + e.target.result + '" ' +
                            'alt="Aperçu de la nouvelle photo" ' +
                            'class="w-20 h-20 rounded-full object-cover border-2 border-blue-400">' +
                            '<span class="text-sm text-blue-600 font-medium">' +
                            "Nouvelle photo (non enregistrée)</span>";
                        photoInput.parentNode.appendChild(preview);
                    };
                    reader.readAsDataURL(file);
                });
            }

            // ——— Prevent double submission ———
            if (form && submitBtn) {
                form.addEventListener("submit", function () {
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
                parent.querySelectorAll(".field-error").forEach(function (el) {
                    el.remove();
                });
                input.classList.remove("border-red-500");
                input.removeAttribute("aria-invalid");
            }
        });
    })();