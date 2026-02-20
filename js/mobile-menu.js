function toggleMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (!sidebar || !overlay) return;

  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
}

function closeMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (!sidebar || !overlay) return;

  sidebar.classList.remove('active');
  overlay.classList.remove('active');
}

function initMobileMenu() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach((item) => {
    item.addEventListener('click', closeMobileSidebar);
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
      closeMobileSidebar();
    }
  });
}

document.addEventListener('DOMContentLoaded', initMobileMenu);
