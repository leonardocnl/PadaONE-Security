const flowLogic = {
    currentTool: null,

    start: (tool) => {
        flowLogic.currentTool = tool;
        flowLogic.renderStep('start');
    },

    renderStep: (stepId) => {
        const containerId = `flowchart-${flowLogic.currentTool}`;
        const container = document.getElementById(containerId);
        const stepData = flowSteps[flowLogic.currentTool][stepId];

        if (!stepData) return;

        let html = `
            <div class="flow-step ${stepData.status || ''}">
                <h4>${stepData.title}</h4>
                <p>${stepData.desc}</p>
                <div class="flow-options">
        `;

        if (stepData.options) {
            stepData.options.forEach(opt => {
                html += `<button class="btn-option ${opt.primary ? 'primary' : ''}" onclick="flowLogic.renderStep('${opt.next}')">${opt.label}</button>`;
            });
        } else if (stepData.action) {
             html += `<button class="btn-start" onclick="flowLogic.start('${flowLogic.currentTool}')">Reiniciar</button>`;
        }

        html += `</div></div>`;
        container.innerHTML = html;
    }
};

const flowSteps = {
    sca: {
        start: {
            title: "Passo 1: Verificação Inicial",
            desc: "A biblioteca possui vulnerabilidade confirmada no Trivy/deps.dev?",
            options: [
                { label: "Sim", next: "hasPatch", primary: true },
                { label: "Não", next: "clean" }
            ]
        },
        clean: {
            title: "Aprovado",
            desc: "Nenhuma ação necessária. Biblioteca segura.",
            status: "success"
        },
        hasPatch: {
            title: "Passo 2: Correção Disponível",
            desc: "Existe patch de correção sem Breaking Changes?",
            options: [
                { label: "Sim", next: "update", primary: true },
                { label: "Não", next: "reachability" }
            ]
        },
        update: {
            title: "Ação: Atualizar",
            desc: "Realize o update imediato da versão.",
            status: "success"
        },
        reachability: {
            title: "Passo 3: Análise de Alcance",
            desc: "A função vulnerável é efetivamente importada e usada no código?",
            options: [
                { label: "Sim", next: "severity", primary: true },
                { label: "Não", next: "notAffected" }
            ]
        },
        notAffected: {
            title: "Ação: Not Affected",
            desc: "Classifique como não afetado e documente no commit.",
            status: "success"
        },
        severity: {
            title: "Passo 4: Severidade",
            desc: "A severidade CVSS é Alta (7.0+) ou Crítica?",
            options: [
                { label: "Sim (> 7.0)", next: "alternatives", primary: true },
                { label: "Não (< 6.9)", next: "calcEffort" }
            ]
        },
        alternatives: {
            title: "Passo 5: Alternativas",
            desc: "Existem bibliotecas alternativas seguras no Snyk Advisor?",
            options: [
                { label: "Sim", next: "replace", primary: true },
                { label: "Não", next: "calcEffort" }
            ]
        },
        replace: {
            title: "Ação: Substituir",
            desc: "Substitua a biblioteca pela alternativa segura.",
            status: "success"
        },
        calcEffort: {
            title: "Passo 6: Cálculo de Esforço",
            desc: "Use a calculadora na aba ao lado. O esforço é maior que 16h?",
            options: [
                { label: "Sim (> 16h)", next: "waiver" },
                { label: "Não (< 16h)", next: "forceFix", primary: true }
            ]
        },
        waiver: {
            title: "Waiver Permitido",
            desc: "Registre o Waiver no OpenProject. Validade: 10 dias.",
            status: "success"
        },
        forceFix: {
            title: "Bloqueio Obrigatório",
            desc: "O esforço é baixo. Correção mandatória.",
            status: "critical"
        }
    },
    sast: {
        start: {
            title: "Passo 1: Análise de Veracidade",
            desc: "O Semgrep achou um erro de sintaxe ou um erro de lógica real? (Ex: Concatenação segura vs Injection real)",
            options: [
                { label: "É um Erro Real", next: "context", primary: true },
                { label: "É Falso Positivo", next: "fpWaiver" }
            ]
        },
        context: {
            title: "Passo 2: Verificação de Contexto",
            desc: "O arquivo afetado está em código de PRODUÇÃO (controllers, main) ou TESTE (mocks)?",
            options: [
                { label: "Produção", next: "reachability", primary: true },
                { label: "Teste/Mock", next: "testRisk" }
            ]
        },
        reachability: {
            title: "Passo 3: Análise de Alcance",
            desc: "O dado malicioso (Source) realmente chega até a função perigosa (Sink) sem tratamento?",
            options: [
                { label: "Sim (Acançável)", next: "effort", primary: true },
                { label: "Não (Código Morto/Isolado)", next: "deadCodeWaiver" }
            ]
        },
        effort: {
            title: "Passo 4: Avaliação de Esforço (16h)",
            desc: "O tempo para refatorar e testar é maior que 16 horas?",
            options: [
                { label: "Sim (> 16h)", next: "tempWaiver" },
                { label: "Não (< 16h)", next: "fixNow", primary: true }
            ]
        },
        testRisk: {
            title: "Risco Moderado",
            desc: "Em ambiente de teste, injeções são toleráveis, mas segredos não. É um segredo hardcoded?",
            options: [
                { label: "Sim (Credencial)", next: "secretsFlow", primary: true },
                { label: "Não (Outros)", next: "fpWaiver" }
            ]
        },
        secretsFlow: {
            title: "Bloqueio de Segredo",
            desc: "Segredos em testes vazam em logs de CI/CD. Remova imediatamente.",
            status: "critical"
        },
        fpWaiver: {
            title: "Waiver: Falso Positivo",
            desc: "Ação: Gere o comentário //nosemgrep na aba 'Gerador de Waiver'.<br>Status: Classifique como Não Afetado.",
            status: "success"
        },
        deadCodeWaiver: {
            title: "Waiver: Código Inativo",
            desc: "Ação: Documente que a função é inalcançável.<br>Use //nosemgrep com a justificativa de Reachability.",
            status: "success"
        },
        tempWaiver: {
            title: "Waiver Temporário Permitido",
            desc: "Esforço alto (>16h). Registre no OpenProject com prazo máx de 90 dias.<br>Se Severidade for CRÍTICA, exige Escalonamento.",
            status: "warning"
        },
        fixNow: {
            title: "Correção Obrigatória",
            desc: "Esforço < 16h. Refatore o código imediatamente. Não é permitido Waiver.",
            status: "critical"
        }
    },
    secrets: {
        start: {
            title: "Verificação de Segredo",
            desc: "A string detectada é uma credencial real (AWS, Banco, API)?",
            options: [
                { label: "Sim (Real)", next: "critical", primary: true },
                { label: "Não (Exemplo/Teste)", next: "fp" }
            ]
        },
        critical: {
            title: "TOLERÂNCIA ZERO",
            desc: "1. Revogue a chave imediatamente.<br>2. Rotacione a credencial.<br>3. Remova do código.<br>4. Expurgue o histórico git.",
            status: "critical"
        },
        fp: {
            title: "Falso Positivo",
            desc: "Adicione o fingerprint ao .gitleaksignore e justifique no commit.",
            status: "success"
        }
    }
};