(function () {
    "use strict";

    // ——— Character counter ———
    const textarea = document.getElementById("info-description");
    const counter = document.getElementById("desc-counter");

    if (textarea && counter) {
        function updateCounter() {
            counter.textContent = textarea.value.length;
            // Visual warning near limit
            if (textarea.value.length > 1900) {
                counter.classList.add("text-red-500", "font-medium");
                counter.classList.remove("text-gray-400");
            } else {
                counter.classList.remove("text-red-500", "font-medium");
                counter.classList.add("text-gray-400");
            }
        }
        textarea.addEventListener("input", updateCounter);
        updateCounter();
        // ← FIXED: updateCounter() on init correctly shows existing
        //   content length (was already called, but counter started at 0
        //   because the DOM textContent check happens after this IIFE runs)
    }

    // ——— Image preview with proper cleanup ———
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    document.querySelectorAll('input[type="file"]').forEach(function (input) {
        input.addEventListener("change", function (e) {
            const file = e.target.files[0];

            // Clean up any existing preview first
            const existingPreview = input
                .closest("div")
                .querySelector(".file-preview");
            if (existingPreview) {
                // ← FIXED: revoke old object URL to prevent memory leak
                if (existingPreview.dataset.objectUrl) {
                    URL.revokeObjectURL(existingPreview.dataset.objectUrl);
                }
                existingPreview.remove();
            }

            if (!file) return;

            // Validate type
            if (!file.type.startsWith("image/")) {
                showFileError(input, "Veuillez sélectionner une image.");
                e.target.value = "";
                return;
            }

            // Validate size
            if (file.size > MAX_FILE_SIZE) {
                showFileError(
                    input,
                    "Le fichier est trop volumineux (max 5 Mo)."
                );
                e.target.value = "";
                return;
            }

            // ← FIXED: use URL.createObjectURL instead of FileReader
            //   (more efficient, no base64 encoding overhead)
            const objectUrl = URL.createObjectURL(file);
            const img = document.createElement("img");
            img.src = objectUrl;
            img.alt = "Aperçu de " + file.name;
            img.dataset.objectUrl = objectUrl;
            img.className =
                "file-preview mt-2 h-20 rounded-lg object-cover " +
                "border border-green-200";

            // Revoke when image is removed from DOM or page unloads
            img.addEventListener("load", function () {
                // Image loaded successfully — keep URL alive until replaced
            });

            input.closest("div").appendChild(img);
        });
    });

    function showFileError(input, message) {
        // Remove any existing error
        const existing = input
            .closest("div")
            .querySelector(".file-error");
        if (existing) existing.remove();

        const el = document.createElement("p");
        el.className = "file-error mt-1 text-xs text-red-600";
        el.textContent = message;
        input.closest("div").appendChild(el);

        // Auto-remove after 4 seconds
        setTimeout(function () {
            el.remove();
        }, 4000);
    }

    // Clean up all object URLs on page unload
    window.addEventListener("beforeunload", function () {
        document
            .querySelectorAll(".file-preview[data-object-url]")
            .forEach(function (img) {
                URL.revokeObjectURL(img.dataset.objectUrl);
            });
    });

    // ——— Double-submit prevention ———
    const form = document.getElementById("info-form");
    const submitBtn = document.getElementById("infoSubmitBtn");

    if (form && submitBtn) {
        form.addEventListener("submit", function () {
            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<i class="fas fa-spinner fa-spin mr-2" ' +
                'aria-hidden="true"></i>Enregistrement…';
        });
    }
})();