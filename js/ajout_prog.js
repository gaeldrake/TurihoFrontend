(function () {
  "use strict";

  var dateDebut = document.getElementById("prog-date-debut");
  var dateFin = document.getElementById("prog-date-fin");

  if (dateDebut && dateFin) {
    // Update min constraint on date_fin when date_debut changes
    dateDebut.addEventListener("change", function () {
      if (dateDebut.value) {
        dateFin.min = dateDebut.value;
        // Clear date_fin if it's now before date_debut
        if (dateFin.value && dateFin.value < dateDebut.value) {
          dateFin.value = "";
        }
      } else {
        dateFin.removeAttribute("min");
      }
    });

    // Update max constraint on date_debut when date_fin changes
    dateFin.addEventListener("change", function () {
      if (dateFin.value) {
        dateDebut.max = dateFin.value;
      } else {
        dateDebut.removeAttribute("max");
      }
    });
  }
})();