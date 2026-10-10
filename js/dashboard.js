document.addEventListener("DOMContentLoaded", function () {

    // ============================================
    //  UTILITAIRES
    // ============================================

    /**
     * Sélecteur sécurisé par ID
     * @param {string} id
     * @returns {HTMLElement|null}
     */
    function getEl(id) {
        return document.getElementById(id);
    }

    /**
     * Attache un événement si l'élément existe
     * @param {string}   id       - ID de l'élément
     * @param {string}   event    - Type d'événement
     * @param {Function} handler  - Callback
     */
    function on(id, event, handler) {
        var el = typeof id === "string" ? getEl(id) : id;
        if (el) el.addEventListener(event, handler);
    }

    /**
     * Formate une taille en octets vers une chaîne lisible
     * @param {number} bytes
     * @returns {string}
     */
    function formatSize(bytes) {
        if (bytes === 0) return "0 o";
        var units = ["o", "Ko", "Mo", "Go"];
        var i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + " " + units[i];
    }


    // ============================================
    //  1. ONGLETS
    // ============================================

    function initTabs() {
        var tabBtns = document.querySelectorAll(".tab-btn");
        var tabContents = document.querySelectorAll(".tab-content");

        if (!tabBtns.length || !tabContents.length) return;

        function activateTab(btn) {
            var tabId = btn.dataset.tab;
            var targetContent = getEl(tabId);

            if (!targetContent) {
                console.warn("Onglet introuvable :", tabId);
                return;
            }

            tabBtns.forEach(function (b) {
                b.classList.remove("border-green-600", "text-green-700", "bg-green-50");
                b.setAttribute("aria-selected", "false");
            });

            tabContents.forEach(function (c) {
                c.classList.remove("active");
            });

            btn.classList.add("border-green-600", "text-green-700", "bg-green-50");
            btn.setAttribute("aria-selected", "true");
            targetContent.classList.add("active");
        }

        tabBtns.forEach(function (btn) {
            btn.addEventListener("click", function () {
                activateTab(btn);
            });
        });

        var activeBtn = document.querySelector(".tab-btn[aria-selected='true']");
        if (activeBtn) {
            activateTab(activeBtn);
        } else if (tabBtns[0]) {
            activateTab(tabBtns[0]);
        }
    }


    // ============================================
    //  2. DESCRIPTION — TOGGLE + COMPTEUR
    // ============================================

    function initDescriptionToggle() {
        var toggleDescBtn = getEl("toggle-desc-edit");
        var cancelDescBtn = getEl("cancel-desc-edit");
        var descDisplay   = getEl("desc-display");
        var descForm      = getEl("desc-form");
        var textarea      = getEl("desc-textarea");
        var charCount     = getEl("desc-current-count");

        if (!descDisplay || !descForm) return;

        var MAX_DESC = 2000;

        function showEditMode() {
            descDisplay.classList.add("hidden");
            descForm.classList.remove("hidden");

            if (toggleDescBtn) {
                toggleDescBtn.innerHTML =
                    '<i class="fas fa-eye mr-1"></i> <span>Aperçu</span>';
            }

            if (textarea) textarea.focus();
        }

        function hideEditMode() {
            descForm.classList.add("hidden");
            descDisplay.classList.remove("hidden");

            if (toggleDescBtn) {
                toggleDescBtn.innerHTML =
                    '<i class="fas fa-edit"></i> <span>Modifier</span>';
            }
        }

        if (toggleDescBtn) {
            toggleDescBtn.addEventListener("click", function () {
                if (descForm.classList.contains("hidden")) {
                    showEditMode();
                } else {
                    hideEditMode();
                }
            });
        }

        if (cancelDescBtn) {
            cancelDescBtn.addEventListener("click", hideEditMode);
        }

        // Compteur de caractères temps réel
        if (textarea && charCount) {
            textarea.addEventListener("input", function () {
                var len = textarea.value.length;
                charCount.textContent = len;

                var counter = charCount.parentElement;
                if (counter) {
                    counter.classList.toggle("text-red-500", len > MAX_DESC - 100);
                    counter.classList.toggle("text-gray-400", len <= MAX_DESC - 100);
                }
            });
        }
    }


    // ============================================
    //  3. GALERIE PHOTOS — UPLOAD
    // ============================================

    function initPhotoUpload() {
        var MAX_SIZE  = 5 * 1024 * 1024;   // 5 Mo
        var MAX_FILES = 10;
        var ALLOWED   = ["image/png", "image/jpeg", "image/gif", "image/webp"];

        var dropZone     = getEl("drop-zone");
        var fileInput    = getEl("photo-upload");
        var previewGrid  = getEl("upload-preview");
        var uploadActions = getEl("upload-actions");
        var uploadCount  = getEl("upload-count");
        var cancelUpload = getEl("cancel-upload");
        var errorsDiv    = getEl("upload-errors");
        var errorMsg     = getEl("upload-error-msg");
        var photoForm    = getEl("photo-form");
        var progressDiv  = getEl("upload-progress");
        var progressBar  = getEl("progress-bar");
        var progressPct  = getEl("progress-percent");

        if (!dropZone || !fileInput || !photoForm) return;

        // ── Drag & Drop ──

        var dragEvents = ["dragenter", "dragover", "dragleave", "drop"];

        dragEvents.forEach(function (evt) {
            dropZone.addEventListener(evt, function (e) {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ["dragenter", "dragover"].forEach(function (evt) {
            dropZone.addEventListener(evt, function () {
                dropZone.classList.add("drag-over");
            });
        });

        ["dragleave", "drop"].forEach(function (evt) {
            dropZone.addEventListener(evt, function () {
                dropZone.classList.remove("drag-over");
            });
        });

        dropZone.addEventListener("drop", function (e) {
            var dt = new DataTransfer();
            var files = e.dataTransfer.files;

            for (var i = 0; i < files.length; i++) {
                dt.items.add(files[i]);
            }

            fileInput.files = dt.files;
            handleFiles(fileInput.files);
        });

        fileInput.addEventListener("change", function () {
            handleFiles(fileInput.files);
        });

        // ── Validation + Prévisualisation ──

        /**
         * Valide et affiche les fichiers sélectionnés
         * @param {FileList} files
         */
        function handleFiles(files) {
            hideError();

            if (previewGrid) previewGrid.innerHTML = "";

            if (!files || files.length === 0) {
                toggleUploadUI(false);
                return;
            }

            // Vérifier le nombre
            if (files.length > MAX_FILES) {
                showError("Vous pouvez envoyer " + MAX_FILES + " fichiers maximum.");
                return;
            }

            // Vérifier chaque fichier
            var errors = [];

            for (var i = 0; i < files.length; i++) {
                var f = files[i];

                if (ALLOWED.indexOf(f.type) === -1) {
                    errors.push("« " + f.name + " » : format non supporté");
                } else if (f.size > MAX_SIZE) {
                    errors.push(
                        "« " + f.name + " » : " + formatSize(f.size) + " (max 5 Mo)"
                    );
                }
            }

            if (errors.length > 0) {
                showError(errors.join("<br>"));
                return;
            }

            // Tout est valide → afficher les aperçus
            toggleUploadUI(true);

            if (uploadCount) {
                uploadCount.textContent = "(" + files.length + ")";
            }

            for (var j = 0; j < files.length; j++) {
                createPreview(files[j]);
            }
        }

        /**
         * Crée une vignette d'aperçu pour un fichier
         * @param {File} file
         */
        function createPreview(file) {
            if (!previewGrid) return;

            var reader = new FileReader();

            reader.onload = function (e) {
                var div = document.createElement("div");
                div.className =
                    "preview-thumb relative rounded-lg overflow-hidden " +
                    "aspect-square bg-gray-100";
                div.innerHTML =
                    '<img src="' + e.target.result + '" ' +
                    '     alt="Aperçu ' + file.name + '" ' +
                    '     class="w-full h-full object-cover">' +
                    '<div class="absolute bottom-0 inset-x-0 bg-black/50 px-2 py-1">' +
                    '  <p class="text-white text-[10px] truncate">' + file.name + "</p>" +
                    '  <p class="text-white/70 text-[9px]">' + formatSize(file.size) + "</p>" +
                    "</div>";
                previewGrid.appendChild(div);
            };

            reader.readAsDataURL(file);
        }

        /**
         * Affiche / masque la zone d'aperçu et les boutons
         * @param {boolean} show
         */
        function toggleUploadUI(show) {
            if (previewGrid) {
                previewGrid.classList.toggle("hidden", !show);
            }
            if (uploadActions) {
                uploadActions.classList.toggle("hidden", !show);
            }
        }

        // ── Annuler la sélection ──

        if (cancelUpload) {
            cancelUpload.addEventListener("click", function () {
                fileInput.value = "";
                if (previewGrid) previewGrid.innerHTML = "";
                toggleUploadUI(false);
                hideError();
            });
        }

        // ── Erreurs ──

        function showError(msg) {
            if (errorsDiv && errorMsg) {
                errorsDiv.classList.remove("hidden");
                errorMsg.innerHTML = msg;
            }
            toggleUploadUI(false);
            fileInput.value = "";
        }

        function hideError() {
            if (errorsDiv) errorsDiv.classList.add("hidden");
            if (errorMsg) errorMsg.innerHTML = "";
        }

        // ── Soumission AJAX avec progression ──

        photoForm.addEventListener("submit", function (e) {
            e.preventDefault();

            if (!fileInput.files || fileInput.files.length === 0) return;

            var formData = new FormData(photoForm);
            var xhr = new XMLHttpRequest();

            // Afficher la barre de progression
            if (progressDiv) progressDiv.classList.remove("hidden");
            toggleUploadUI(false);

            xhr.upload.addEventListener("progress", function (ev) {
                if (ev.lengthComputable && progressBar && progressPct) {
                    var pct = Math.round((ev.loaded / ev.total) * 100);
                    progressBar.style.width = pct + "%";
                    progressPct.textContent = pct + "%";
                }
            });

            xhr.addEventListener("load", function () {
                if (xhr.status >= 200 && xhr.status < 400) {
                    window.location.reload();
                } else {
                    if (progressDiv) progressDiv.classList.add("hidden");
                    showError("Erreur lors de l'envoi (code " + xhr.status + "). Réessayez.");
                }
            });

            xhr.addEventListener("error", function () {
                if (progressDiv) progressDiv.classList.add("hidden");
                showError("Erreur réseau. Vérifiez votre connexion.");
            });

            xhr.open("POST", photoForm.action);
            xhr.send(formData);
        });
    }


    // ============================================
    //  4. GALERIE PHOTOS — SUPPRESSION
    // ============================================

    function initPhotoDelete() {
        var forms = document.querySelectorAll(".delete-photo-form");

        forms.forEach(function (form) {
            form.addEventListener("submit", function (e) {
                e.preventDefault();

                var confirmed = confirm(
                    "Voulez-vous vraiment supprimer cette photo ?\n" +
                    "Cette action est irréversible."
                );

                if (!confirmed) return;

                // Animation de sortie
                var card = form.closest(".group");

                if (card) {
                    card.style.transition = "all .3s ease";
                    card.style.opacity = "0";
                    card.style.transform = "scale(.8)";

                    setTimeout(function () {
                        form.submit();
                    }, 300);
                } else {
                    form.submit();
                }
            });
        });
    }


    // ============================================
    //  5. GALERIE PHOTOS — MODAL APERÇU
    // ============================================

    function initPhotoModal() {
        var modal    = getEl("photo-modal");
        var modalImg = getEl("modal-img");
        var closeBtn = getEl("close-modal");

        if (!modal || !modalImg) return;

        var previewBtns = document.querySelectorAll(".preview-btn");

        function openPhotoModal(src) {
            modalImg.src = src;
            modal.classList.remove("hidden");
            modal.classList.add("flex");
            document.body.style.overflow = "hidden";

            if (closeBtn) closeBtn.focus();
        }

        function closePhotoModal() {
            modal.classList.add("hidden");
            modal.classList.remove("flex");
            document.body.style.overflow = "";
            modalImg.src = "";
        }

        previewBtns.forEach(function (btn) {
            btn.addEventListener("click", function () {
                var src = btn.dataset.src;
                if (src) openPhotoModal(src);
            });
        });

        if (closeBtn) {
            closeBtn.addEventListener("click", closePhotoModal);
        }

        // Fermer en cliquant sur le fond
        modal.addEventListener("click", function (e) {
            if (e.target === modal) closePhotoModal();
        });

        // Fermer avec Escape
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && !modal.classList.contains("hidden")) {
                closePhotoModal();
            }
        });

        // Navigation clavier gauche / droite
        document.addEventListener("keydown", function (e) {
            if (modal.classList.contains("hidden")) return;
            if (previewBtns.length < 2) return;

            var currentSrc = modalImg.src;
            var currentIndex = -1;

            previewBtns.forEach(function (btn, i) {
                if (currentSrc.indexOf(btn.dataset.src) !== -1) {
                    currentIndex = i;
                }
            });

            if (currentIndex === -1) return;

            var newIndex = -1;

            if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                newIndex = (currentIndex + 1) % previewBtns.length;
            } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                newIndex =
                    (currentIndex - 1 + previewBtns.length) % previewBtns.length;
            }

            if (newIndex !== -1) {
                e.preventDefault();
                modalImg.src = previewBtns[newIndex].dataset.src;
            }
        });
    }


    // ============================================
    //  6. VOIR PLUS MEMBRES
    // ============================================

    function initVoirPlusMembres() {
        var voirPlusBtn = getEl("voir-plus-membres");
        if (!voirPlusBtn) return;

        voirPlusBtn.addEventListener("click", function () {
            var hiddenCards = document.querySelectorAll(".membre-card.hidden");

            hiddenCards.forEach(function (card, index) {
                // Animation d'apparition décalée
                setTimeout(function () {
                    card.classList.remove("hidden");
                    card.style.opacity = "0";
                    card.style.transform = "translateY(10px)";
                    card.style.transition = "all .3s ease";

                    requestAnimationFrame(function () {
                        card.style.opacity = "1";
                        card.style.transform = "translateY(0)";
                    });
                }, index * 80);
            });

            voirPlusBtn.style.transition = "all .3s ease";
            voirPlusBtn.style.opacity = "0";

            setTimeout(function () {
                voirPlusBtn.remove();
            }, 300);
        });
    }


    // ============================================
    //  7. MODALES GÉNÉRIQUES
    // ============================================

    var activeModals = [];

    /**
     * Configure une modale avec ouverture, fermeture et accessibilité
     * @param {string} openId   - ID du bouton d'ouverture
     * @param {string} closeId  - ID du bouton de fermeture
     * @param {string} modalId  - ID de la modale
     */
    function setupModal(openId, closeId, modalId) {
        var openBtn  = getEl(openId);
        var closeBtn = getEl(closeId);
        var modal    = getEl(modalId);

        if (!modal) return;

        function openModal() {
            modal.classList.remove("hidden");
            modal.setAttribute("aria-hidden", "false");
            activeModals.push(modal);
            document.body.style.overflow = "hidden";

            if (closeBtn) closeBtn.focus();
        }

        function closeModal() {
            modal.classList.add("hidden");
            modal.setAttribute("aria-hidden", "true");

            var index = activeModals.indexOf(modal);
            if (index > -1) activeModals.splice(index, 1);

            if (activeModals.length === 0) {
                document.body.style.overflow = "";
            }

            if (openBtn) openBtn.focus();
        }

        if (openBtn) openBtn.addEventListener("click", openModal);
        if (closeBtn) closeBtn.addEventListener("click", closeModal);

        modal.addEventListener("click", function (e) {
            if (e.target === modal) closeModal();
        });
    }

    // Escape global pour modales génériques
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && activeModals.length > 0) {
            var topModal = activeModals[activeModals.length - 1];
            topModal.classList.add("hidden");
            topModal.setAttribute("aria-hidden", "true");
            activeModals.pop();

            if (activeModals.length === 0) {
                document.body.style.overflow = "";
            }
        }
    });


    // ============================================
    //  8. PARTAGER
    // ============================================

    function initShareMenu() {
        var shareBtn  = getEl("shareBtn");
        var shareMenu = getEl("shareMenu");

        if (!shareBtn || !shareMenu) return;

        function closeMenu() {
            shareMenu.classList.add("hidden");
            shareBtn.setAttribute("aria-expanded", "false");
        }

        function toggleMenu() {
            var isOpen = !shareMenu.classList.contains("hidden");
            shareMenu.classList.toggle("hidden");
            shareBtn.setAttribute("aria-expanded", String(!isOpen));
        }

        shareBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            toggleMenu();
        });

        document.addEventListener("click", function (e) {
            if (!shareBtn.contains(e.target) && !shareMenu.contains(e.target)) {
                closeMenu();
            }
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && !shareMenu.classList.contains("hidden")) {
                closeMenu();
                shareBtn.focus();
            }
        });
    }


    // ============================================
    //  9. AFFICHAGE NOM FICHIER (DOCUMENTS)
    // ============================================

    function initFileInput() {
        var docFileInput = getEl("doc-file");
        if (!docFileInput) return;

        var MAX_DOC_SIZE = 10 * 1024 * 1024; // 10 Mo

        docFileInput.addEventListener("change", function () {
            var label = docFileInput.previousElementSibling;
            if (!label) return;

            var textEl = label.querySelector("p");
            if (!textEl) return;

            if (docFileInput.files.length > 0) {
                var file = docFileInput.files[0];

                if (file.size > MAX_DOC_SIZE) {
                    textEl.textContent =
                        "⚠ Fichier trop volumineux (" +
                        formatSize(file.size) +
                        ", max 10 Mo)";
                    textEl.classList.add("text-red-500");
                    docFileInput.value = "";
                    return;
                }

                textEl.textContent = file.name + " (" + formatSize(file.size) + ")";
                textEl.classList.remove("text-red-500");
            } else {
                textEl.textContent = "Glissez un fichier ou cliquez ici";
                textEl.classList.remove("text-red-500");
            }
        });
    }


    // ============================================
    //  10. COPIER DANS LE PRESSE-PAPIER
    // ============================================

    /**
     * Copie un texte dans le presse-papier avec feedback visuel
     * @param {string} text
     */
    window.copyToClipboard = function (text) {

        function onSuccess() {
            var shareMenu = getEl("shareMenu");
            var copyBtn = shareMenu ? shareMenu.querySelector("button") : null;

            if (copyBtn) {
                var original = copyBtn.innerHTML;
                copyBtn.innerHTML =
                    '<i class="fas fa-check w-4 text-green-500"></i> Copié !';

                setTimeout(function () {
                    copyBtn.innerHTML = original;
                }, 2000);
            }
        }

        function fallbackCopy() {
            var textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.select();

            try {
                document.execCommand("copy");
                onSuccess();
            } catch (e) {
                prompt("Copiez ce lien :", text);
            }

            document.body.removeChild(textarea);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(onSuccess).catch(function () {
                fallbackCopy();
            });
        } else {
            fallbackCopy();
        }
    };


    // ============================================
    //  LANCER TOUTES LES INITIALISATIONS
    // ============================================

    initTabs();
    initDescriptionToggle();
    initPhotoUpload();
    initPhotoDelete();
    initPhotoModal();
    initVoirPlusMembres();
    setupModal("open-doc-modal",     "close-doc-modal",     "doc-modal");
    setupModal("open-contact-modal", "close-contact-modal", "contact-modal");
    initShareMenu();
    initFileInput();
});