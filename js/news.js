(function () {
  "use strict";

  // Character counter for subject
  var sujetInput = document.getElementById("nl-sujet");
  var sujetCount = document.getElementById("sujet-count");

  if (sujetInput && sujetCount) {
    function updateCount() {
      sujetCount.textContent = sujetInput.value.length;
    }
    sujetInput.addEventListener("input", updateCount);
    updateCount(); // Initialize on page load
  }

  // Prevent double-click on send
  var form = document.getElementById("newsletter-form");
  var sendBtn = document.getElementById("send-btn");

  if (form && sendBtn) {
    form.addEventListener("submit", function (e) {
      // Only disable on actual send, not preview
      var activeBtn = document.activeElement;
      if (activeBtn && activeBtn.value === "send") {
        setTimeout(function () {
          sendBtn.disabled = true;
          sendBtn.innerHTML =
            '<i class="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>Envoi en cours…';
        }, 0);

        // Re-enable after timeout in case of network failure
        setTimeout(function () {
          sendBtn.disabled = false;
          sendBtn.innerHTML =
            '<i class="fas fa-paper-plane mr-2" aria-hidden="true"></i>Envoyer la newsletter';
        }, 30000);
      }
    });
  }
})();