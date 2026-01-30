const utils = {
    copyCode: async (elementId) => {
        const codeElement = document.getElementById(elementId);
        if (!codeElement) return;

        try {
            await navigator.clipboard.writeText(codeElement.innerText);
            alert('Código copiado para a área de transferência!');
        } catch (err) {
            console.error('Falha ao copiar', err);
        }
    },

    // Inicializar navegação por âncoras internas
    initAnchorLinks: () => {
        document.addEventListener('click', function(event) {
            const target = event.target.closest('a[href^="#"]');
            if (!target) return;

            const href = target.getAttribute('href');
            // Ignora links vazios ou que têm onclick customizado
            if (href === '#' || target.hasAttribute('onclick')) return;

            event.preventDefault();
            const sectionId = href.slice(1);
            const section = document.getElementById(sectionId);

            if (section) {
                // Scroll suave até a seção
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });

                // Destacar brevemente a seção
                const originalBg = section.style.backgroundColor;
                section.style.backgroundColor = 'rgba(99, 102, 241, 0.15)';
                section.style.transition = 'background-color 0.3s ease';
                
                setTimeout(() => {
                    section.style.backgroundColor = originalBg;
                }, 2000);
            }
        });
    }
};

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', utils.initAnchorLinks);
