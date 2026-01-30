const nav = {
    history: [],
    currentPage: 'dashboard',

    switchTool: (toolId, isBack = false) => {
        // Mapear IDs de ferramentas para nomes de páginas
        const pageMap = {
            'dashboard': 'dashboard',
            'logic': 'logic',
            'trivy': 'trivy',
            'semgrep': 'semgrep',
            'gitleaks': 'gitleaks'
        };

        const pageName = pageMap[toolId] || 'dashboard';
        nav.currentPage = pageName;

        // Carregar página dinamicamente via index.html
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

        // Atualizar histórico
        if (!isBack) {
            if (nav.history.length === 0 || nav.history[nav.history.length - 1] !== toolId) {
                nav.history.push(toolId);
            }
        }

        // Atualizar breadcrumb quando página for carregada
        setTimeout(() => {
            const breadcrumb = document.getElementById('breadcrumb');
            if (breadcrumb) {
                breadcrumb.innerText = title;
            }

            // Marcar item de navegação como ativo
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });

            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(`switchTool('${toolId}')`)) {
                    item.classList.add('active');
                }
            });

            // Iniciar fluxogramas se necessário - aguarda scripts serem carregados
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
        // Voltar sempre para o dashboard
        nav.switchTool('dashboard');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // A página inicial é carregada pelo index.html
    // Apenas sincronizar o estado
    nav.history.push('dashboard');
});
