document.addEventListener('DOMContentLoaded', () => {

    /* ───── 1. TOGGLE DESCRIPTION ───── */

    const btnToggle  = document.getElementById('toggle-desc-edit');
    const btnCancel  = document.getElementById('cancel-desc-edit');
    const descDisplay = document.getElementById('desc-display');
    const descForm   = document.getElementById('desc-form');
    const textarea   = document.getElementById('desc-textarea');
    const charCount  = document.getElementById('desc-current-count');

    function showDescForm() {
        descDisplay.classList.add('hidden');
        descForm.classList.remove('hidden');
        textarea.focus();
        btnToggle.innerHTML = '<i class="fas fa-eye mr-1"></i> Aperçu';
    }

    function hideDescForm() {
        descForm.classList.add('hidden');
        descDisplay.classList.remove('hidden');
        btnToggle.innerHTML = '<i class="fas fa-edit mr-1"></i> Modifier';
    }

    btnToggle.addEventListener('click', () => {
        descForm.classList.contains('hidden') ? showDescForm() : hideDescForm();
    });

    btnCancel.addEventListener('click', hideDescForm);

    // Compteur de caractères
    textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        charCount.textContent = len;
        charCount.parentElement.classList.toggle('text-red-500', len > 1900);
    });


    /* ───── 2. UPLOAD PHOTOS ───── */

    const MAX_SIZE  = 5 * 1024 * 1024;   // 5 Mo
    const MAX_FILES = 10;
    const ALLOWED   = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

    const dropZone      = document.getElementById('drop-zone');
    const fileInput      = document.getElementById('photo-upload');
    const previewGrid    = document.getElementById('upload-preview');
    const uploadActions  = document.getElementById('upload-actions');
    const uploadCount    = document.getElementById('upload-count');
    const cancelUpload   = document.getElementById('cancel-upload');
    const errorsDiv      = document.getElementById('upload-errors');
    const errorMsg       = document.getElementById('upload-error-msg');
    const photoForm      = document.getElementById('photo-form');

    // Drag & drop
    ['dragenter', 'dragover'].forEach(evt => {
        dropZone.addEventListener(evt, e => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
    });
    ['dragleave', 'drop'].forEach(evt => {
        dropZone.addEventListener(evt, e => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
        });
    });

    dropZone.addEventListener('drop', e => {
        const dt = new DataTransfer();
        [...e.dataTransfer.files].forEach(f => dt.items.add(f));
        fileInput.files = dt.files;
        handleFiles(fileInput.files);
    });

    fileInput.addEventListener('change', () => handleFiles(fileInput.files));

    function handleFiles(files) {
        hideError();
        previewGrid.innerHTML = '';

        if (files.length === 0) {
            previewGrid.classList.add('hidden');
            uploadActions.classList.add('hidden');
            return;
        }

        // Validations
        if (files.length > MAX_FILES) {
            return showError(`Vous pouvez envoyer ${MAX_FILES} fichiers maximum.`);
        }

        const invalid = [];
        [...files].forEach(f => {
            if (!ALLOWED.includes(f.type))
                invalid.push(`« ${f.name} » : format non supporté`);
            else if (f.size > MAX_SIZE)
                invalid.push(`« ${f.name} » : dépasse 5 Mo`);
        });

        if (invalid.length) {
            return showError(invalid.join('<br>'));
        }

        // Prévisualisation
        previewGrid.classList.remove('hidden');
        uploadActions.classList.remove('hidden');
        uploadCount.textContent = `(${files.length})`;

        [...files].forEach((file, i) => {
            const reader = new FileReader();
            reader.onload = e => {
                const div = document.createElement('div');
                div.className = 'preview-thumb relative rounded-lg overflow-hidden aspect-square bg-gray-100';
                div.innerHTML = `
                    <img src="${e.target.result}"
                         alt="Aperçu ${file.name}"
                         class="w-full h-full object-cover">
                    <div class="absolute bottom-0 inset-x-0 bg-black/50 px-2 py-1">
                        <p class="text-white text-[10px] truncate">${file.name}</p>
                    </div>`;
                previewGrid.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    }

    cancelUpload.addEventListener('click', () => {
        fileInput.value = '';
        previewGrid.innerHTML = '';
        previewGrid.classList.add('hidden');
        uploadActions.classList.add('hidden');
        hideError();
    });

    function showError(msg) {
        errorsDiv.classList.remove('hidden');
        errorMsg.innerHTML = msg;
        previewGrid.classList.add('hidden');
        uploadActions.classList.add('hidden');
        fileInput.value = '';
    }

    function hideError() {
        errorsDiv.classList.add('hidden');
        errorMsg.innerHTML = '';
    }

    // Soumission avec barre de progression (AJAX)
    photoForm.addEventListener('submit', e => {
        e.preventDefault();

        const formData = new FormData(photoForm);
        const xhr = new XMLHttpRequest();

        const progressDiv = document.getElementById('upload-progress');
        const progressBar = document.getElementById('progress-bar');
        const progressPct = document.getElementById('progress-percent');

        progressDiv.classList.remove('hidden');
        uploadActions.classList.add('hidden');

        xhr.upload.addEventListener('progress', ev => {
            if (ev.lengthComputable) {
                const pct = Math.round((ev.loaded / ev.total) * 100);
                progressBar.style.width = pct + '%';
                progressPct.textContent = pct + '%';
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 400) {
                window.location.reload();
            } else {
                progressDiv.classList.add('hidden');
                showError('Erreur lors de l\'envoi. Veuillez réessayer.');
            }
        });

        xhr.addEventListener('error', () => {
            progressDiv.classList.add('hidden');
            showError('Erreur réseau. Vérifiez votre connexion.');
        });

        xhr.open('POST', photoForm.action);
        xhr.send(formData);
    });


    /* ───── 3. SUPPRESSION PHOTO (confirmation améliorée) ───── */

    document.querySelectorAll('.delete-photo-form').forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();
            if (confirm('Voulez-vous vraiment supprimer cette photo ? Cette action est irréversible.')) {
                // Animation de sortie
                const card = form.closest('.group');
                card.style.transition = 'all .3s ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(.8)';
                setTimeout(() => form.submit(), 300);
            }
        });
    });


    /* ───── 4. MODAL APERÇU ───── */

    const modal    = document.getElementById('photo-modal');
    const modalImg = document.getElementById('modal-img');
    const closeBtn = document.getElementById('close-modal');

    document.querySelectorAll('.preview-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modalImg.src = btn.dataset.src;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeModal() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
        modalImg.src = '';
    }

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
    });
});