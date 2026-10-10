    (function () {
        "use strict";

        document.addEventListener("DOMContentLoaded", function () {
            var photoInput = document.getElementById("photo");
            var form = document.querySelector("form");
            var submitBtn = document.getElementById("submit-btn");

            // ——— Image preview ———
            if (photoInput) {
                photoInput.addEventListener("change", function () {
                    // Remove existing preview
                    var existing = document.getElementById("photo-preview");
                    if (existing) existing.remove();

                    var file = photoInput.files[0];
                    if (!file) return;

                    // FIX 19: Client-side file size validation.
                    // The backend should also validate, but catching a 20MB file
                    // here saves the user a long upload + server rejection.
                    var maxSize = 5 * 1024 * 1024; // 5 MB
                    if (file.size > maxSize) {
                        alert("Le fichier est trop volumineux. Taille maximum : 5 Mo.");
                        photoInput.value = "";
                        return;
                    }

                    // Show preview
                    if (file.type.startsWith("image/")) {
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            var preview = document.createElement("img");
                            preview.id = "photo-preview";
                            preview.src = e.target.result;
                            preview.alt = "Aperçu de la photo sélectionnée";
                            preview.className = "mt-3 w-24 h-24 object-cover rounded-full border-2 border-gray-200";
                            photoInput.parentNode.appendChild(preview);
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }

            // ——— Prevent double submission ———
            if (form && submitBtn) {
                form.addEventListener("submit", function () {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>Ajout en cours…';

                    // Re-enable after 10s as safety fallback
                    setTimeout(function () {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<i class="fas fa-user-plus mr-2" aria-hidden="true"></i>Ajouter le membre';
                    }, 10000);
                });
            }
        });
    })();