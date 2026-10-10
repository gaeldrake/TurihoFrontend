    document.addEventListener("DOMContentLoaded", function () {
      const VISIBLE_DURATION = 4000;
      const FADE_DURATION = 500;

      setTimeout(function () {
        var messages = document.querySelectorAll('.flash-message');
        for (var i = 0; i < messages.length; i++) {
          (function (el) {
            el.classList.add('opacity-0');
            setTimeout(function () {
              if (el.parentNode) {
                el.remove();
              }
            }, FADE_DURATION);
          })(messages[i]);
        }
      }, VISIBLE_DURATION);
    });