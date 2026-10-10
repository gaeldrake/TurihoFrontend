    (function () {
        "use strict";

        document.addEventListener("DOMContentLoaded", function () {
            var form = document.getElementById("edit-org-form");
            var submitBtn = document.getElementById("submit-btn");
            var logoInput = document.getElementById("logo");
            var linksContainer = document.getElementById("links-container");
            var addLinkBtn = document.getElementById("add-link-btn");
            var linksHidden = document.getElementById("links-hidden");
            var passwordField = document.getElementById("password");
            var confirmField = document.getElementById("password_confirm");

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

            // ——— FIX 13: Password confirmation validation ———
            if (passwordField && confirmField) {
                function validatePasswords() {
                    clearFieldError(confirmField);

                    if (!passwordField.value && !confirmField.value) return true;

                    if (passwordField.value && !confirmField.value) {
                        showFieldError(
                            confirmField,
                            "Veuillez confirmer le nouveau mot de passe."
                        );
                        return false;
                    }

                    if (passwordField.value !== confirmField.value) {
                        showFieldError(
                            confirmField,
                            "Les mots de passe ne correspondent pas."
                        );
                        return false;
                    }

                    if (passwordField.value.length < 8) {
                        showFieldError(
                            passwordField,
                            "Le mot de passe doit contenir au moins 8 caractères."
                        );
                        return false;
                    }

                    return true;
                }

                confirmField.addEventListener("blur", validatePasswords);
                passwordField.addEventListener("blur", function () {
                    if (confirmField.value) validatePasswords();
                });
            }

            // ——— Dynamic social links ———
            if (addLinkBtn && linksContainer) {
                addLinkBtn.addEventListener("click", function () {
                    addLinkRow("");
                });

                // Remove button delegation
                linksContainer.addEventListener("click", function (e) {
                    var removeBtn = e.target.closest(".remove-link-btn");
                    if (removeBtn) {
                        removeBtn.closest(".link-row").remove();
                        formChanged = true;
                    }
                });

                // If no links exist, show one empty row
                if (linksContainer.children.length === 0) {
                    addLinkRow("");
                }
            }

            function addLinkRow(value) {
                var row = document.createElement("div");
                row.className = "link-row flex gap-2 items-center";
                row.innerHTML =
                    '<input type="text" name="link_urls[]" value="' + escapeHtml(value) + '" ' +
                    'placeholder="https://facebook.com/votre-page" maxlength="255" ' +
                    'class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 ' +
                    'focus:ring-green-500 focus:outline-none">' +
                    '<button type="button" class="remove-link-btn text-red-500 ' +
                    'hover:text-red-700 p-2 rounded transition-colors ' +
                    'focus:outline-none focus:ring-2 focus:ring-red-300" ' +
                    'aria-label="Supprimer ce lien">' +
                    '<i class="fas fa-trash-alt" aria-hidden="true"></i></button>';
                linksContainer.appendChild(row);
            }

            // ——— Sync links to hidden field before submit ———
            // Backend expects comma-separated URLs in "links" field
            if (form && linksHidden) {
                form.addEventListener("submit", function () {
                    var inputs = linksContainer.querySelectorAll('input[name="link_urls[]"]');
                    var urls = [];
                    inputs.forEach(function (input) {
                        var val = input.value.trim();
                        if (val) urls.push(val);
                    });
                    linksHidden.value = urls.join(",");
                });
            }

            // ——— Logo preview + validation ———
            if (logoInput) {
                logoInput.addEventListener("change", function () {
                    var existing = document.getElementById("new-logo-preview");
                    if (existing) existing.remove();
                    clearFieldError(logoInput);

                    var file = logoInput.files[0];
                    if (!file) return;

                    var maxSize = 5 * 1024 * 1024;
                    if (file.size > maxSize) {
                        showFieldError(logoInput, "Fichier trop volumineux (max 5 Mo).");
                        logoInput.value = "";
                        return;
                    }

                    // Dim current logo
                    var currentContainer = document.getElementById("current-logo-container");
                    if (currentContainer) currentContainer.style.opacity = "0.4";

                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var preview = document.createElement("div");
                        preview.id = "new-logo-preview";
                        preview.className = "mt-3 flex items-center gap-3";
                        preview.innerHTML =
                            '<img src="' + e.target.result + '" ' +
                            'alt="Aperçu du nouveau logo" ' +
                            'class="h-20 w-20 object-contain rounded-lg border-2 border-green-400 bg-gray-50 p-1">' +
                            '<span class="text-sm text-green-600 font-medium">' +
                            'Nouveau logo (non enregistré)</span>';
                        logoInput.parentNode.appendChild(preview);
                    };
                    reader.readAsDataURL(file);
                });
            }

            // ——— Form submission ———
            if (form && submitBtn) {
                form.addEventListener("submit", function (e) {
                    // Validate passwords
                    if (passwordField && confirmField && !validatePasswords()) {
                        e.preventDefault();
                        confirmField.focus();
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

            // ——— Helpers ———
            function escapeHtml(str) {
                var div = document.createElement("div");
                div.textContent = str;
                return div.innerHTML;
            }

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