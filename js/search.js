/**
 * search.js — Module de recherche AJAX pour la page Découvrir
 */

(function() {
    "use strict";

    // ════════════════════════════════════════
    // INITIALISATION
    // ════════════════════════════════════════
    
    // Attendre le DOM
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    function init() {
        console.log("🔍 Search module: Initialisation...");

        // Trouver le container avec l'URL AJAX
        var searchContainer = document.getElementById("search-container");
        if (!searchContainer) {
            console.log("🔍 Search module: Pas de search-container, module ignoré");
            return;
        }

        var AJAX_URL = searchContainer.dataset.ajaxUrl;
        if (!AJAX_URL) {
            console.error("🔍 Search module: data-ajax-url manquant");
            return;
        }

        console.log("🔍 Search module: URL =", AJAX_URL);

        // Éléments DOM
        var searchInput = document.getElementById("searchInput");
        var clearBtn = document.getElementById("clearSearch");
        var loader = document.getElementById("loader");
        var results = document.getElementById("results");
        var resultCount = document.getElementById("resultCount");
        var pagination = document.getElementById("pagination");
        var filterBtns = document.querySelectorAll(".filter-btn");

        if (!searchInput || !results) {
            console.error("🔍 Search module: Éléments manquants", {
                searchInput: !!searchInput,
                results: !!results
            });
            return;
        }

        console.log("🔍 Search module: Éléments OK, filtres:", filterBtns.length);

        // ════════════════════════════════════════
        // ÉTAT
        // ════════════════════════════════════════
        var currentType = "";
        var debounceTimer = null;
        var currentController = null;
        var DEBOUNCE_DELAY = 350;

        // ════════════════════════════════════════
        // HELPERS
        // ════════════════════════════════════════
        function escapeHtml(text) {
            var div = document.createElement("div");
            div.textContent = text;
            return div.innerHTML;
        }

        function setLoading(isLoading) {
            if (loader) {
                loader.classList.toggle("hidden", !isLoading);
            }
            results.style.opacity = isLoading ? "0.4" : "1";
        }

        function toggleClearButton(show) {
            if (clearBtn) {
                clearBtn.classList.toggle("hidden", !show);
            }
        }

        function updateResultCount(query, count) {
            if (!resultCount) return;

            if (query || currentType) {
                var text = count + " résultat" + (count !== 1 ? "s" : "");
                if (query) {
                    text += ' pour "' + escapeHtml(query) + '"';
                }
                resultCount.textContent = text;
                resultCount.classList.remove("hidden");
            } else {
                resultCount.classList.add("hidden");
            }
        }

        function togglePagination(show) {
            if (pagination) {
                pagination.classList.toggle("hidden", !show);
            }
        }

        function showError(message) {
            results.innerHTML =
                '<div class="col-span-full text-center py-12">' +
                    '<i class="fas fa-exclamation-triangle text-red-300 text-4xl mb-3"></i>' +
                    '<p class="text-gray-500 text-lg">' + escapeHtml(message) + '</p>' +
                    '<button type="button" id="retryBtn" class="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">' +
                        '<i class="fas fa-redo mr-1"></i> Réessayer' +
                    '</button>' +
                '</div>';

            var retryBtn = document.getElementById("retryBtn");
            if (retryBtn) {
                retryBtn.addEventListener("click", fetchResults);
            }
        }

        function updateBrowserURL(query, type) {
            try {
                var url = new URL(window.location.href);
                
                if (query) {
                    url.searchParams.set("q", query);
                } else {
                    url.searchParams.delete("q");
                }
                
                if (type) {
                    url.searchParams.set("type", type);
                } else {
                    url.searchParams.delete("type");
                }
                
                history.replaceState(null, "", url.toString());
            } catch (e) {
                console.warn("URL update failed:", e);
            }
        }

        // ════════════════════════════════════════
        // RECHERCHE AJAX
        // ════════════════════════════════════════
        function fetchResults() {
            var query = searchInput.value.trim();

            console.log("🔍 Recherche:", { query: query, type: currentType });

            toggleClearButton(query.length > 0);

            // Construire l'URL
            var url = AJAX_URL;
            var params = [];

            if (query) {
                params.push("q=" + encodeURIComponent(query));
            }
            if (currentType) {
                params.push("type=" + encodeURIComponent(currentType));
            }

            if (params.length > 0) {
                url += "?" + params.join("&");
            }

            console.log("🔍 URL:", url);

            // Annuler la requête précédente
            if (currentController) {
                currentController.abort();
            }

            currentController = new AbortController();
            setLoading(true);

            fetch(url, {
                method: "GET",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "Accept": "text/html"
                },
                signal: currentController.signal
            })
            .then(function(response) {
                console.log("🔍 Réponse:", response.status);

                if (!response.ok) {
                    throw new Error("Erreur serveur (" + response.status + ")");
                }
                return response.text();
            })
            .then(function(html) {
                console.log("🔍 HTML reçu:", html.length, "caractères");

                results.innerHTML = html;
                currentController = null;

                // Compter les cartes
                var cards = results.querySelectorAll("[data-org-card]");
                console.log("🔍 Cartes:", cards.length);

                updateResultCount(query, cards.length);
                togglePagination(!query && !currentType);
                updateBrowserURL(query, currentType);
            })
            .catch(function(error) {
                if (error.name === "AbortError") {
                    console.log("🔍 Requête annulée");
                    return;
                }

                console.error("🔍 Erreur:", error);
                currentController = null;
                showError(error.message);
            })
            .finally(function() {
                setLoading(false);
            });
        }

        // ════════════════════════════════════════
        // EVENT LISTENERS
        // ════════════════════════════════════════

        // Input avec debounce
        searchInput.addEventListener("input", function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(fetchResults, DEBOUNCE_DELAY);
        });

        // Enter pour recherche immédiate
        searchInput.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                e.preventDefault();
                clearTimeout(debounceTimer);
                fetchResults();
            }
        });

        // Bouton clear
        if (clearBtn) {
            clearBtn.addEventListener("click", function() {
                searchInput.value = "";
                toggleClearButton(false);
                if (resultCount) resultCount.classList.add("hidden");
                fetchResults();
                searchInput.focus();
            });
        }

        // Filtres
        filterBtns.forEach(function(btn) {
            btn.addEventListener("click", function() {
                var newType = btn.dataset.type || "";
                console.log("🔍 Filtre:", newType);

                // Mise à jour visuelle
                filterBtns.forEach(function(b) {
                    var isActive = b === btn;

                    b.classList.toggle("bg-green-600", isActive);
                    b.classList.toggle("text-white", isActive);
                    b.classList.toggle("shadow-sm", isActive);
                    b.classList.toggle("bg-white", !isActive);
                    b.classList.toggle("border", !isActive);
                    b.classList.toggle("border-gray-200", !isActive);
                    b.classList.toggle("text-gray-700", !isActive);
                });

                currentType = newType;
                fetchResults();
            });
        });

        // Raccourcis clavier
        document.addEventListener("keydown", function(e) {
            var tag = document.activeElement.tagName;
            var isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

            // / ou Ctrl+K pour focus
            if ((e.key === "/" && !isInput) || (e.key === "k" && (e.ctrlKey || e.metaKey))) {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
            }

            // Escape pour vider
            if (e.key === "Escape" && document.activeElement === searchInput) {
                searchInput.value = "";
                searchInput.blur();
                toggleClearButton(false);
                if (resultCount) resultCount.classList.add("hidden");
            }
        });

        // ════════════════════════════════════════
        // RESTAURER L'ÉTAT DEPUIS L'URL
        // ════════════════════════════════════════
        function restoreState() {
            try {
                var urlParams = new URLSearchParams(window.location.search);
                var q = urlParams.get("q") || "";
                var type = urlParams.get("type") || "";

                console.log("🔍 État initial:", { q: q, type: type });

                if (q) {
                    searchInput.value = q;
                    toggleClearButton(true);
                }

                if (type) {
                    currentType = type;
                    filterBtns.forEach(function(btn) {
                        var isActive = (btn.dataset.type || "") === type;

                        btn.classList.toggle("bg-green-600", isActive);
                        btn.classList.toggle("text-white", isActive);
                        btn.classList.toggle("shadow-sm", isActive);
                        btn.classList.toggle("bg-white", !isActive);
                        btn.classList.toggle("border", !isActive);
                        btn.classList.toggle("border-gray-200", !isActive);
                        btn.classList.toggle("text-gray-700", !isActive);
                    });
                }

                if (q || type) {
                    fetchResults();
                }
            } catch (e) {
                console.warn("🔍 Restauration état:", e);
            }
        }

        restoreState();
        console.log("🔍 Search module: Prêt!");
    }

})();