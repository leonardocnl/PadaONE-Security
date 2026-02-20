const calculators = {
  calculateEffortHours: () => {
    const tA = parseFloat(document.getElementById('time-analysis').value) || 0;
    const tI = parseFloat(document.getElementById('time-implementation').value) || 0;
    const tV = parseFloat(document.getElementById('time-validation').value) || 0;
    const resultBox = document.getElementById('effort-result');

    const totalEffort = tA + tI + tV;

    resultBox.classList.remove('hidden', 'allowed', 'blocked');

    let message = '';
    if (totalEffort >= 16) {
      resultBox.classList.add('allowed');
      message = `<strong>Esforço Total: ${totalEffort}h</strong><br>O esforço excede 16 horas. Você está <strong>AUTORIZADO</strong> a solicitar um Waiver.`;
    } else {
      resultBox.classList.add('blocked');
      message = `<strong>Esforço Total: ${totalEffort}h</strong><br>O esforço é menor que 16 horas. A correção é <strong>OBRIGATÓRIA</strong> e imediata.`;
    }

    resultBox.innerHTML = message;
  },

  generateSemgrepWaiver: () => {
    const ruleId = document.getElementById('semgrep-rule-id').value;
    const reason = document.getElementById('semgrep-reason').value;
    const output = document.getElementById('semgrep-output');

    if (!ruleId) {
      alert('Por favor, insira o ID da regra.');
      return;
    }

    const comment = `// nosemgrep: ${ruleId}\n// Motivo: [Waiver de Segurança] - ${reason}`;
    output.innerText = comment;
  },
};
