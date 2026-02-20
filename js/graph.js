const dashboardGraph = {
  cy: null,

  init: () => {
    if (dashboardGraph.cy) {
      console.log('Gráfico já inicializado');
      return;
    }

    const container = document.getElementById('cy');
    if (!container) {
      console.warn('Container #cy não encontrado');
      return;
    }

    if (typeof cytoscape === 'undefined') {
      console.error('Cytoscape não está carregado');
      container.innerHTML =
        '<div style="padding: 40px; text-align: center; color: var(--status-critical);">Erro: Cytoscape não carregou. Recarregue a página.</div>';
      return;
    }

    try {
      if (typeof cytoscapeDagre !== 'undefined') {
        cytoscape.use(cytoscapeDagre);
      }

      dashboardGraph.cy = cytoscape({
        container: container,
        boxSelectionEnabled: false,
        autounselectify: true,
        userZoomingEnabled: true,
        userPanningEnabled: true,
        wheelSensitivity: 0.2,

        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#0D1117',
              label: 'data(label)',
              color: '#F8FAFC',
              'font-family': 'JetBrains Mono, monospace',
              'font-size': '9px',
              'text-valign': 'center',
              'text-halign': 'center',
              width: '100px',
              height: '50px',
              shape: 'rectangle',
              'border-width': 2,
              'border-style': 'solid',
              'text-wrap': 'wrap',
              'text-max-width': '90px',
            },
          },
          {
            selector: 'edge',
            style: {
              width: 2,
              'line-color': '#4B5563',
              'target-arrow-color': '#4B5563',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'arrow-scale': 1,
            },
          },
          {
            selector: 'edge.failure',
            style: {
              'line-style': 'dashed',
              'line-color': '#EF4444',
              'target-arrow-color': '#EF4444',
            },
          },
          {
            selector: '.start_stop',
            style: {
              'border-color': '#94A3B8',
              'background-color': '#F8F9FA',
              color: '#343A40',
              shape: 'ellipse',
              width: '70px',
              height: '70px',
            },
          },
          {
            selector: '.gate',
            style: {
              'border-color': '#FF6B6B',
              'background-color': 'rgba(255, 107, 107, 0.1)',
              color: '#C92A2A',
              'font-weight': 'bold',
            },
          },
          {
            selector: '.process',
            style: {
              'border-color': '#845EF7',
              'background-color': 'rgba(132, 94, 247, 0.1)',
              color: '#5F3DC4',
            },
          },
          {
            selector: '.success',
            style: {
              'border-color': '#40C057',
              'background-color': 'rgba(64, 192, 87, 0.1)',
              color: '#2B8A3E',
            },
          },
          {
            selector: '.monitor',
            style: {
              'border-color': '#228BE6',
              'background-color': 'rgba(34, 139, 230, 0.1)',
              color: '#1864AB',
            },
          },
          {
            selector: '.alert',
            style: {
              'border-color': '#FAB005',
              'background-color': 'rgba(250, 176, 5, 0.1)',
              color: '#F59F00',
              shape: 'diamond',
              width: '100px',
              height: '100px',
            },
          },
          {
            selector: '.clickable',
            style: {
              cursor: 'pointer',
            },
          },
        ],

        elements: {
          nodes: [
            { data: { id: 'Start', label: 'Início' }, classes: 'start_stop' },
            { data: { id: 'Fim', label: 'Fim' }, classes: 'start_stop' },
            { data: { id: 'Commit', label: 'Commit' }, classes: 'start_stop' },

            { data: { id: 'Ambiente', label: 'Configurar\nAmbiente' }, classes: 'process' },
            { data: { id: 'VSCode', label: 'Instalar\nVS Code' }, classes: 'process' },
            { data: { id: 'Sonar', label: 'SonarQube\nfor IDE' }, classes: 'process' },

            { data: { id: 'LibCheck', label: 'Nova Lib?' }, classes: 'alert clickable' },
            { data: { id: 'Deps', label: 'Consultar\ndeps.dev' }, classes: 'alert clickable' },
            { data: { id: 'VulnCheck', label: 'Vulnerável?' }, classes: 'alert' },
            { data: { id: 'Alternativa', label: 'Buscar\nAlternativa' }, classes: 'alert' },

            { data: { id: 'Codar', label: 'Codificação' }, classes: 'process' },
            { data: { id: 'GitleaksL', label: 'Gitleaks\nLocal' }, classes: 'gate clickable' },
            { data: { id: 'TrivyL', label: 'Trivy\nLocal' }, classes: 'gate clickable' },
            { data: { id: 'SemgrepL', label: 'Semgrep\nLocal' }, classes: 'gate clickable' },
            { data: { id: 'QuebraL', label: 'Falha\nLocal' }, classes: 'gate' },

            { data: { id: 'Push', label: 'Push de\nCódigo' }, classes: 'start_stop' },
            { data: { id: 'GitleaksP', label: 'Gitleaks:\nSegredos' }, classes: 'gate clickable' },
            { data: { id: 'TrivyP', label: 'Trivy:\nSCA' }, classes: 'gate clickable' },
            { data: { id: 'SemgrepP', label: 'Semgrep:\nSAST' }, classes: 'gate clickable' },
            { data: { id: 'Quebra', label: 'Pipeline\nInterrompido' }, classes: 'gate' },
            { data: { id: 'AnaliseFalha', label: 'Análise da Falha\n[Time Segurança]' }, classes: 'alert' },
            { data: { id: 'DAST', label: 'DAST:\nOWASP ZAP' }, classes: 'gate' },

            { data: { id: 'Staging', label: 'Staging\nValidado' }, classes: 'success' },
            { data: { id: 'Syft', label: 'Syft:\nSBOM' }, classes: 'monitor' },
            { data: { id: 'DT', label: 'Dependency\nTrack' }, classes: 'monitor' },

            { data: { id: 'TriagemEscopo', label: 'Triagem de\nEscopo' }, classes: 'alert' },
            { data: { id: 'Burp', label: 'Pentest:\nBurp Suite' }, classes: 'process' },
            { data: { id: 'Evidencias', label: 'Coleta de\nEvidências' }, classes: 'monitor' },
            { data: { id: 'TriagemF', label: 'Triagem\nFinal' }, classes: 'alert' },
            { data: { id: 'Relatorio', label: 'Relatório\nFinal' }, classes: 'process' },
            { data: { id: 'SignOff', label: 'Sign-off' }, classes: 'success' },
          ],
          edges: [
            { data: { source: 'Start', target: 'Ambiente' } },
            { data: { source: 'Ambiente', target: 'VSCode' } },
            { data: { source: 'VSCode', target: 'Sonar' } },
            { data: { source: 'Sonar', target: 'LibCheck' } },

            { data: { source: 'LibCheck', target: 'Deps' } },
            { data: { source: 'Deps', target: 'VulnCheck' } },
            { data: { source: 'VulnCheck', target: 'Alternativa' } },
            { data: { source: 'Alternativa', target: 'Deps' } },
            { data: { source: 'VulnCheck', target: 'Codar' } },
            { data: { source: 'LibCheck', target: 'Codar' } },

            { data: { source: 'Codar', target: 'GitleaksL' } },
            { data: { source: 'GitleaksL', target: 'TrivyL' } },
            { data: { source: 'TrivyL', target: 'SemgrepL' } },
            { data: { source: 'SemgrepL', target: 'Commit' } },

            { data: { source: 'GitleaksL', target: 'QuebraL' }, classes: 'failure' },
            { data: { source: 'TrivyL', target: 'QuebraL' }, classes: 'failure' },
            { data: { source: 'SemgrepL', target: 'QuebraL' }, classes: 'failure' },
            { data: { source: 'QuebraL', target: 'Codar' } },

            { data: { source: 'Commit', target: 'Push' } },
            { data: { source: 'Push', target: 'GitleaksP' } },
            { data: { source: 'Push', target: 'TrivyP' } },
            { data: { source: 'Push', target: 'SemgrepP' } },

            { data: { source: 'GitleaksP', target: 'DAST' } },
            { data: { source: 'TrivyP', target: 'DAST' } },
            { data: { source: 'SemgrepP', target: 'DAST' } },

            { data: { source: 'GitleaksP', target: 'Quebra' }, classes: 'failure' },
            { data: { source: 'TrivyP', target: 'Quebra' }, classes: 'failure' },
            { data: { source: 'SemgrepP', target: 'Quebra' }, classes: 'failure' },
            { data: { source: 'Quebra', target: 'AnaliseFalha' } },
            { data: { source: 'AnaliseFalha', target: 'Codar' } },
            { data: { source: 'AnaliseFalha', target: 'TriagemF' }, classes: 'failure' },

            { data: { source: 'DAST', target: 'Staging' } },
            { data: { source: 'DAST', target: 'TriagemF' }, classes: 'failure' },
            { data: { source: 'Staging', target: 'Syft' } },
            { data: { source: 'Syft', target: 'DT' } },

            { data: { source: 'DT', target: 'TriagemEscopo' } },
            { data: { source: 'TriagemEscopo', target: 'Burp' } },
            { data: { source: 'TriagemEscopo', target: 'Relatorio' } },
            { data: { source: 'Burp', target: 'Evidencias' } },
            { data: { source: 'Evidencias', target: 'TriagemF' } },
            { data: { source: 'TriagemF', target: 'Relatorio' } },
            { data: { source: 'TriagemF', target: 'Codar' } },
            { data: { source: 'Relatorio', target: 'SignOff' } },
            { data: { source: 'SignOff', target: 'Fim' } },

            { data: { source: 'SignOff', target: 'Codar' }, classes: 'failure' },
          ],
        },

        layout: {
          name: 'dagre',
          rankDir: 'LR',
          padding: 50,
          spacingFactor: 1.5,
          nodeSep: 60,
          edgeSep: 20,
          rankSep: 120,
          animate: false,
        },
      });

      dashboardGraph.cy.on('tap', 'node', function (evt) {
        const node = evt.target;
        const id = node.id();

        if (id.includes('Trivy')) {
          nav.switchTool('trivy');
        } else if (id.includes('Semgrep')) {
          nav.switchTool('semgrep');
        } else if (id.includes('Gitleaks')) {
          nav.switchTool('gitleaks');
        } else if (id === 'LibCheck' || id === 'Deps') {
          nav.switchTool('logic');
        }
      });

      dashboardGraph.cy.on('mouseover', 'node.clickable', function () {
        document.body.style.cursor = 'pointer';
      });

      dashboardGraph.cy.on('mouseout', 'node.clickable', function () {
        document.body.style.cursor = 'default';
      });

      setTimeout(() => {
        dashboardGraph.cy.fit(null, 30);
      }, 100);

      console.log('✅ Gráfico DevSecOps Pipeline inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar Cytoscape:', error);

      if (container) {
        container.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--status-critical); font-family: 'JetBrains Mono', monospace; text-align: center; padding: 40px;">
                        <div>
                            <i class="ph ph-warning-circle" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>
                            <div style="font-size: 1.1rem; margin-bottom: 10px;">Erro ao carregar o Pipeline DevSecOps</div>
                            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 20px;">Verifique o console (F12) para mais detalhes</div>
                            <button onclick="location.reload()" style="background: var(--primary-blue); color: #fff; border: none; padding: 10px 20px; cursor: pointer; font-family: inherit;">
                                Recarregar Página
                            </button>
                        </div>
                    </div>
                `;
      }
    }
  },

  resize: () => {
    if (dashboardGraph.cy) {
      try {
        dashboardGraph.cy.resize();
        dashboardGraph.cy.fit(null, 30);
      } catch (error) {
        console.error('Erro ao redimensionar gráfico:', error);
      }
    }
  },
};

window.addEventListener('resize', () => {
  if (dashboardGraph.cy) {
    dashboardGraph.resize();
  }
});
