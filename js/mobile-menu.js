// ============================================================
// MOBILE MENU HANDLER
// ============================================================

/**
 * Toggle do sidebar em mobile
 */
function toggleMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (!sidebar || !overlay) return;
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

/**
 * Fechar o sidebar
 */
function closeMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (!sidebar || !overlay) return;
    
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
}

/**
 * Inicializar event listeners
 */
function initMobileMenu() {
    // Fechar sidebar ao clicar em um item de navegação
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', closeMobileSidebar);
    });

    // Fechar sidebar ao redimensionar para desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMobileSidebar();
        }
    });
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initMobileMenu);
