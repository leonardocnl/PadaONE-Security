const nav = {
    history: [],

    switchTool: (toolId, isBack = false) => {
        document.querySelectorAll('.tool-layout').forEach(el => el.classList.add('hidden'));
        
        const target = document.getElementById(`view-${toolId}`);
        if(target) target.classList.remove('hidden');
        
        const title = toolId === 'dashboard' ? 'Dashboard' : toolId.charAt(0).toUpperCase() + toolId.slice(1);
        document.getElementById('breadcrumb').innerText = `DevSecOps > ${title}`;
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if(item.innerText.toLowerCase().includes(title.toLowerCase())) item.classList.add('active');
        });

        const backBtn = document.getElementById('btn-back');
        if (!isBack) {
            if (nav.history.length === 0 || nav.history[nav.history.length - 1] !== toolId) {
                nav.history.push(toolId);
            }
        }

        if (backBtn) {
            if (nav.history.length > 1) {
                backBtn.style.display = 'flex';
            } else {
                backBtn.style.display = 'none';
            }
        }

        if(toolId === 'semgrep' && typeof flowLogic !== 'undefined') flowLogic.start('sast');
        if(toolId === 'gitleaks' && typeof flowLogic !== 'undefined') flowLogic.start('secrets');
        if(toolId === 'logic' && typeof flowLogic !== 'undefined') flowLogic.start('sca');
    },

    goBack: () => {
        if (nav.history.length > 1) {
            nav.history.pop();
            const previousPage = nav.history[nav.history.length - 1];
            nav.switchTool(previousPage, true);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    nav.switchTool('dashboard');
});