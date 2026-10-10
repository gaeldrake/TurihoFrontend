    (function () {
      var btn = document.getElementById('mobile-menu-btn');
      var menu = document.getElementById('admin-nav-menu');
      if (!btn || !menu) return;

      btn.addEventListener('click', function () {
        var isExpanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!isExpanded));
        menu.classList.toggle('hidden');

        if (!isExpanded) {
          menu.classList.add('flex', 'flex-col', 'absolute', 'top-16', 'left-0', 'right-0', 'bg-white', 'shadow-lg', 'p-4', 'z-50');
        } else {
          menu.classList.remove('flex', 'flex-col', 'absolute', 'top-16', 'left-0', 'right-0', 'bg-white', 'shadow-lg', 'p-4', 'z-50');
        }
      });

      document.addEventListener('click', function (event) {
        if (!btn.contains(event.target) && !menu.contains(event.target)) {
          btn.setAttribute('aria-expanded', 'false');
          menu.classList.add('hidden');
          menu.classList.remove('flex', 'flex-col', 'absolute', 'top-16', 'left-0', 'right-0', 'bg-white', 'shadow-lg', 'p-4', 'z-50');
        }
      });
    })();