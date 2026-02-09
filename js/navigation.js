window.nav = window.nav || {
    history: [],
    currentPage: 'dashboard',

    switchTool: (toolId, isBack = false) => {
        const pageMap = {
            'dashboard': 'dashboard',
            'logic': 'logic',
            'trivy': 'trivy',
            'semgrep': 'semgrep',
            'gitleaks': 'gitleaks'
        };

        const pageName = pageMap[toolId] || 'dashboard';
        nav.currentPage = pageName;

        if (window.loadPage && typeof window.loadPage === 'function') {
            window.loadPage(pageName);
        }

        const title = {
            'dashboard': 'Dashboard',
            'logic': 'Lógica de Bibliotecas',
            'trivy': 'Trivy (SCA)',
            'semgrep': 'Semgrep (SAST)',
            'gitleaks': 'Gitleaks (Secrets)'
        }[toolId] || 'Dashboard';

        if (!isBack) {
            if (nav.history.length === 0 || nav.history[nav.history.length - 1] !== toolId) {
                nav.history.push(toolId);
            }
        }

        setTimeout(() => {
            const breadcrumb = document.getElementById('breadcrumb');
            if (breadcrumb) {
                breadcrumb.innerText = title;
            }

            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });

            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(`switchTool('${toolId}')`)) {
                    item.classList.add('active');
                }
            });

            setTimeout(() => {
                if (toolId === 'semgrep' && typeof flowLogic !== 'undefined') {
                    try {
                        flowLogic.start('sast');
                    } catch (e) {
                        console.error('Erro ao iniciar fluxograma SAST:', e);
                    }
                }
                if (toolId === 'gitleaks' && typeof flowLogic !== 'undefined') {
                    try {
                        flowLogic.start('secrets');
                    } catch (e) {
                        console.error('Erro ao iniciar fluxograma Secrets:', e);
                    }
                }
                if (toolId === 'logic' && typeof flowLogic !== 'undefined') {
                    try {
                        flowLogic.start('sca');
                    } catch (e) {
                        console.error('Erro ao iniciar fluxograma SCA:', e);
                    }
                }
            }, 400);
        }, 150);
    },

    goBack: () => {
        nav.switchTool('dashboard');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    nav.history.push('dashboard');
});
