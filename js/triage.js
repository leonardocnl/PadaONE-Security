let triagePath = [];
let currentStep = 'start';

document.addEventListener('DOMContentLoaded', function () {
  console.log('Triage system loaded');
});

const triageFlows = {
  'vuln-yes': {
    question: 'Existe correção oficial (patch) sem Breaking Changes?',
    breadcrumb: 'Vulnerável',
    options: [
      { text: 'SIM, existe patch', next: 'patch-yes' },
      { text: 'NÃO, sem patch disponível', next: 'patch-no' },
    ],
  },
  'vuln-no': {
    question: 'A biblioteca está sendo mantida ativamente?',
    breadcrumb: 'Sem vulnerabilidades',
    options: [
      { text: 'SIM, manutenção ativa (< 12 meses)', next: 'healthy' },
      { text: 'NÃO, obsoleta (> 12 meses)', next: 'obsolete' },
    ],
  },
  'patch-yes': {
    result: true,
    title: '<i class="ph ph-arrow-circle-up"></i> UPDATE IMEDIATO',
    message:
      'Execute a atualização para a versão corrigida imediatamente. Como existe um patch oficial sem Breaking Changes, a correção deve ser aplicada seguindo o ciclo normal de desenvolvimento.',
    color: 'var(--primary-blue)',
    bgColor: 'rgba(99, 102, 241, 0.1)',
  },
  'patch-no': {
    question: 'A função vulnerável é importada/utilizada no código?',
    breadcrumb: 'Vulnerável → Sem patch',
    options: [
      { text: 'SIM, função é utilizada', next: 'function-used' },
      { text: 'NÃO, função não é importada', next: 'function-not-used' },
    ],
  },
  'function-used': {
    question: 'Existe alternativa viável no socket.dev (score de manutenção > 85)?',
    breadcrumb: 'Vulnerável → Sem patch → Função utilizada',
    options: [
      { text: 'SIM, existe alternativa', next: 'alternative-yes' },
      { text: 'NÃO, sem alternativa', next: 'alternative-no' },
    ],
  },
  'function-not-used': {
    question: 'Qual a severidade (CVSS)?',
    breadcrumb: 'Vulnerável → Sem patch → Função NÃO utilizada',
    options: [
      { text: 'CVSS < 7.0', next: 'not-used-low' },
      { text: 'CVSS ≥ 7.0', next: 'not-used-high' },
    ],
  },
  'alternative-yes': {
    result: true,
    title: '<i class="ph ph-arrows-clockwise"></i> SUBSTITUIR BIBLIOTECA',
    message:
      'Migre para a alternativa identificada no socket.dev. Execute a substituição conforme análise de esforço e compatibilidade funcional.',
    color: 'var(--accent-cyan)',
    bgColor: 'rgba(34, 211, 238, 0.1)',
  },
  'alternative-no': {
    question: 'Qual o tempo estimado de correção/migração?',
    breadcrumb: 'Vulnerável → Sem patch → Função utilizada → Sem alternativa',
    options: [
      { text: '< 16 horas', next: 'time-low' },
      { text: '≥ 16 horas', next: 'time-high' },
    ],
  },
  'time-low': {
    result: true,
    title: '<i class="ph ph-wrench"></i> CORRIGIR IMEDIATAMENTE',
    message:
      'O esforço de correção é aceitável (< 16h). Execute a correção ou refatoração necessária para eliminar a vulnerabilidade.',
    color: 'var(--primary-blue)',
    bgColor: 'rgba(99, 102, 241, 0.1)',
  },
  'time-high': {
    question: 'Qual a severidade (CVSS)?',
    breadcrumb: 'Vulnerável → Sem patch → Função utilizada → Sem alternativa → Esforço alto',
    options: [
      { text: 'CVSS 4.0 - 6.9 (Médio)', next: 'high-effort-medium' },
      { text: 'CVSS 7.0 - 8.9 (Alto)', next: 'high-effort-high' },
      { text: 'CVSS ≥ 9.0 (Crítico)', next: 'high-effort-critical' },
    ],
  },
  'not-used-low': {
    result: true,
    title: '<i class="ph ph-check-circle"></i> EXECUTAR TAREFA (com monitoramento)',
    message:
      'A função vulnerável não é utilizada e o CVSS é baixo. Status: not_affected. Execute a tarefa normalmente, mas mantenha monitoramento periódico.',
    color: 'var(--status-success)',
    bgColor: 'rgba(34, 197, 94, 0.1)',
  },
  'not-used-high': {
    result: true,
    title: '<i class="ph ph-clipboard-text"></i> WAIVER OBRIGATÓRIO',
    message:
      'A função não é utilizada, mas o CVSS é alto (≥ 7.0). Registre Waiver no Git e OpenProject com justificativa técnica completa. Status: not_affected. Prazo de reavaliação: 10 dias.',
    color: 'var(--accent-gold)',
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
  'high-effort-medium': {
    result: true,
    title: '<i class="ph ph-note"></i> WAIVER PERMITIDO',
    message:
      'CVSS Médio (4.0-6.9) + esforço alto (≥ 16h). Waiver permitido com justificativa de custo elevado. Registre no Git e OpenProject. Prazo de reavaliação: 10 dias.',
    color: 'var(--primary-blue)',
    bgColor: 'rgba(99, 102, 241, 0.1)',
  },
  'high-effort-high': {
    result: true,
    title: '<i class="ph ph-warning"></i> WAIVER + BUSCA DE ALTERNATIVA',
    message:
      'CVSS Alto (7.0-8.9) + esforço alto. Waiver temporário exige busca obrigatória de alternativa no socket.dev. Documente a inexistência de alternativas viáveis. Prazo: 10 dias.',
    color: 'var(--accent-gold)',
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
  'high-effort-critical': {
    result: true,
    title: '<i class="ph ph-siren"></i> ESCALONAMENTO CRÍTICO',
    message:
      'CVSS Crítico (≥ 9.0) detectado. ESCALONAMENTO OBRIGATÓRIO para o Time de Segurança. Altere status no OpenProject para [Em Revisão]. Waiver só é válido após aprovação do revisor.',
    color: 'var(--status-critical)',
    bgColor: 'rgba(220, 38, 38, 0.1)',
  },
  healthy: {
    result: true,
    title: '<i class="ph ph-check-circle"></i> BIBLIOTECA SAUDÁVEL',
    message:
      'A biblioteca está sem vulnerabilidades conhecidas e mantida ativamente. Execute a tarefa normalmente seguindo o fluxo de desenvolvimento padrão.',
    color: 'var(--status-success)',
    bgColor: 'rgba(34, 197, 94, 0.1)',
  },
  obsolete: {
    result: true,
    title: '<i class="ph ph-magnifying-glass"></i> BUSCAR ALTERNATIVA',
    message:
      'A biblioteca está obsoleta (sem manutenção > 12 meses). Busque alternativa no socket.dev com score de manutenção > 85 antes de prosseguir com a tarefa.',
    color: 'var(--accent-gold)',
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
};

function triageFlow(step) {
  console.log('Triage flow called with step:', step);

  const flow = triageFlows[step];

  if (!flow) {
    console.error('Flow not found for step:', step);
    return;
  }

  if (flow.breadcrumb) {
    triagePath.push(flow.breadcrumb);
  }

  if (flow.result) {
    showResult(flow);
    return;
  }

  showQuestion(flow);
}

function showQuestion(flow) {
  const questionDiv = document.getElementById('triage-question');

  if (!questionDiv) {
    console.error('Element triage-question not found');
    return;
  }

  let buttonsHTML = '';
  flow.options.forEach((option, index) => {
    buttonsHTML += `
            <button class="triage-btn" onclick="triageFlow('${option.next}')" 
                aria-label="${option.text}"
                style="flex: 1; padding: 12px 20px; background: transparent; 
                border: 1px solid var(--border-subtle); color: var(--text-main); 
                font-weight: 500; cursor: pointer; 
                transition: all 0.2s; font-size: 0.9rem;">
                ${option.text}
            </button>
        `;
  });

  questionDiv.innerHTML = `
        <h5 style="color: var(--primary-blue); margin-bottom: 20px; font-size: 1rem; font-weight: 600;" id="triage-question-heading">${flow.question}</h5>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;" role="group" aria-label="Opções de resposta">
            ${buttonsHTML}
        </div>
    `;

  questionDiv.style.display = 'block';

  // Focus first button for keyboard users
  setTimeout(() => {
    const firstButton = questionDiv.querySelector('.triage-btn');
    if (firstButton) {
      firstButton.focus();
    }
  }, 100);

  const resultDiv = document.getElementById('triage-result');
  if (resultDiv) {
    resultDiv.style.display = 'none';
  }
}

function showResult(flow) {
  const questionDiv = document.getElementById('triage-question');
  const resultDiv = document.getElementById('triage-result');
  const resultText = document.getElementById('result-text');

  if (!questionDiv || !resultDiv || !resultText) {
    console.error('Required elements not found');
    return;
  }

  questionDiv.style.display = 'none';

  resultDiv.style.display = 'block';
  resultDiv.style.borderColor = flow.color;
  resultDiv.style.background = flow.bgColor;

  resultText.innerHTML = `
        <div style="font-size: 1.2rem; font-weight: 700; color: ${flow.color}; margin-bottom: 10px;">
            ${flow.title}
        </div>
        <div style="color: var(--text-main);">
            ${flow.message}
        </div>
    `;
}

function resetTriage() {
  console.log('Resetting triage');

  triagePath = [];
  currentStep = 'start';

  const breadcrumbDiv = document.getElementById('triage-breadcrumb');
  const breadcrumbText = document.getElementById('breadcrumb-text');

  if (breadcrumbDiv && breadcrumbText) {
    breadcrumbDiv.style.display = 'none';
    breadcrumbText.textContent = '';
  }

  const questionDiv = document.getElementById('triage-question');
  if (questionDiv) {
    questionDiv.style.display = 'block';
    questionDiv.innerHTML = `
            <h5 style="color: var(--primary-blue); margin-bottom: 20px; font-size: 1rem; font-weight: 600;" id="triage-question-heading">A biblioteca possui vulnerabilidades conhecidas?</h5>
            <div style="display: flex; gap: 12px;" role="group" aria-label="Opções de resposta">
                <button class="triage-btn" onclick="triageFlow('vuln-yes')" 
                    aria-label="Sim, a biblioteca possui vulnerabilidades"
                    style="flex: 1; padding: 12px 20px; background: transparent; 
                    border: 1px solid var(--border-subtle); color: var(--text-main); 
                    font-weight: 500; cursor: pointer; 
                    transition: all 0.2s; font-size: 0.9rem;">
                    SIM, possui vulnerabilidades
                </button>
                <button class="triage-btn" onclick="triageFlow('vuln-no')" 
                    aria-label="Não, a biblioteca não possui vulnerabilidades"
                    style="flex: 1; padding: 12px 20px; background: transparent; 
                    border: 1px solid var(--border-subtle); color: var(--text-main); 
                    font-weight: 500; cursor: pointer; 
                    transition: all 0.2s; font-size: 0.9rem;">
                    NÃO, sem vulnerabilidades
                </button>
            </div>
        `;
  }

  const resultDiv = document.getElementById('triage-result');
  if (resultDiv) {
    resultDiv.style.display = 'none';
  }

  // Announce reset to screen readers
  const interactiveTriage = document.getElementById('interactive-triage');
  if (interactiveTriage) {
    interactiveTriage.setAttribute('aria-live', 'polite');
  }
}

(function addTriageStyles() {
  const existingStyle = document.getElementById('triage-hover-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  const style = document.createElement('style');
  style.id = 'triage-hover-styles';
  style.textContent = `
        .triage-btn:hover {
            background: rgba(99, 102, 241, 0.2) !important;
            border-color: var(--primary-blue) !important;
        }
        .triage-btn:focus-visible {
            outline: 2px solid var(--primary-blue) !important;
            outline-offset: 2px !important;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2) !important;
        }
    `;
  document.head.appendChild(style);
})();
