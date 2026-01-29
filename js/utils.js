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
    }
};