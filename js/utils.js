window.utils = window.utils || {
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

    initAnchorLinks: () => {
        document.addEventListener('click', function(event) {
            const target = event.target.closest('a[href^="#"]');
            if (!target) return;

            const href = target.getAttribute('href');
            if (href === '#' || target.hasAttribute('onclick')) return;

            event.preventDefault();
            const sectionId = href.slice(1);
            const section = document.getElementById(sectionId);

            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', utils.initAnchorLinks);
