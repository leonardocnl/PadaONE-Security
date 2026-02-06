Projeto IMA
Manual de Triagem de Bibliotecas
Propósito deste documento:
Este manual fornece as diretrizes para que o desenvolvedor decida, de forma autônoma e
fundamentada, entre a correção imediata de uma biblioteca, sua substituição por
alternativas saudáveis ou o aceite temporário de riscos residuais. O objetivo central é
proteger a Supply Chain contra vulnerabilidades herdadas [provenientes de
dependências de terceiros] e minimizar o acúmulo de débito técnico.
- Tabela de Decisão Rápida

Utilize esta tabela como filtro inicial ao identificar uma vulnerabilidade no Trivy ou no
deps.dev:

## Cenário Identificado Condição Técnica Ação Obrigatória
Biblioteca Saudável Sem vulnerabilidades no deps.dev
e manutenção ativa nos últimos 12
meses.
Executar tarefa.
Biblioteca Obsoleta Sem manutenção ativa nos últimos
12 meses.
Buscar alternativa viável no
socket.dev antes de
prosseguir. O score de
manutenção deve ser superior
a 85.
Vulnerabilidade com
## Patch
Existência de correção oficial listada
no deps.dev sem Breaking
## Changes.
Executar correção imediata.
## Vulnerabilidade
## Crítica
CVSS maior que 9.0 e função
alcançável (Reachability).
## Escalonamento Crítico.





- Explicação Técnica do CVSS
O CVSS [Common Vulnerability Scoring System] é o padrão técnico utilizado para
quantificar a severidade de vulnerabilidades em uma escala de 0 a 10. Para este manual, a
análise deve ser dividida em quatro pilares conforme a especificação v4.0:
- Métricas de Base: Representam as qualidades intrínsecas de uma vulnerabilidade
que são constantes ao longo do tempo e entre ambientes de usuário.
- Métricas de Ameaça: Refletem a probabilidade de a vulnerabilidade ser explorada
com base na atividade atual de exploits no "mundo real".
- Métricas Ambientais: Componente crítico para este manual, pois permite ajustar a
pontuação com base nos controles de segurança e na implementação específica da
biblioteca no projeto IMA.
- Métricas Suplementares: Fornecem atributos adicionais sobre a vulnerabilidade
que não impactam a pontuação final, mas auxiliam na tomada de decisão técnica.
- Tabela de Severidade e Ações de Governança
A classificação de risco orienta o fluxo de trabalho e o nível de autonomia do
desenvolvedor:
## Severidade
## (CVSS)
Risco Intrínseco Ação de Governança
0.0 - 3.9 Baixo Atualizar conforme ciclo de manutenção ordinário.
4.0 - 6.9 Médio Waiver permitido se o esforço de correção for superior
a 16 horas.
7.0 - 8.9 Alto Waiver exige busca obrigatória de alternativa no
socket.dev.
9.0 - 10.0 Crítico Escalonamento Crítico obrigatório para o Time de
## Segurança.

- Diferenciação entre Severidade e Risco (Contexto Supply Chain)
● Severidade: É o valor fixo obtido via NVD ou deps.dev que indica o quão perigosa a
falha é teoricamente.
● Risco: É o valor variável confirmado apenas na Análise de Alcance. Uma
vulnerabilidade HIGH (Alta) em uma biblioteca não representa risco real se a função
vulnerável não for efetivamente importada ou executada no código.
● String Vetorial: A representação compacta (ex: CVSS:4.0/AV:N/AC:L/...) deve ser
obrigatoriamente incluída na justificativa do Waiver para permitir auditoria técnica.

## IMA • UFLA • FUNDECC


## Aplicação Prática
● Severidade vs. Risco Real: O CVSS quantifica a gravidade intrínseca da falha, mas
o risco real é condicionado ao contexto de uso no projeto. Uma nota HIGH (Alta) só
é confirmada como risco após a Análise de Alcance (Reachability), caso a função
vulnerável seja efetivamente importada no código.
● Gatilho de Governança: No GEDAI, o valor 9.0 no CVSS é o limite técnico que
define a obrigatoriedade do Escalonamento Crítico em casos de vulnerabilidade
alcançável. Esse processo exige revisão formal do Time de Segurança.


## Figura 2





## IMA • UFLA • FUNDECC


- Diferenciação de Contexto [Ambiente]
Antes de iniciar a análise técnica, identifique a natureza da biblioteca para definir o
protocolo de segurança aplicado:
Natureza da
## Biblioteca
Contexto de Uso Rigor e Objetivo de Segurança
Dependencies Produção: Enviadas ao
servidor ou usuário final.
Rigor Máximo: Exige score de
manutenção maior que 85 no
socket.dev e remediação imediata
de vulnerabilidades.
devDependencies Desenvolvimento:
Ferramentas de build ou
teste (ex: Tailwind, Jest).
Proteção da Supply Chain: Foco
em prevenir o comprometimento do
ambiente e a introdução de
vulnerabilidades herdadas.
As bibliotecas classificadas como devDependencies podem ser submetidas a uma análise
de risco mais flexível, desde que não executem código em tempo de execução no produto
final, mantendo o foco na integridade da cadeia de suprimentos.

## IMA • UFLA • FUNDECC


- Fluxo de Decisão: Passo a Passo
## Figura 3
Siga esta sequência lógica para validar qualquer biblioteca no projeto:
Passo 1 - Consulta de Saúde e Segurança: Realize a consulta da biblioteca no deps.dev
para verificar a versão atual e a existência de vulnerabilidades conhecidas. Utilize o
socket.dev para validar se a biblioteca possui score de manutenção igual ou superior a 85.
Se a biblioteca não for vulnerável, mas estiver sem manutenção ativa nos últimos 12
meses, pule para a busca de alternativas no Passo 4.
Passo 2 - Verificação de Patch e Remediação: Caso a biblioteca seja vulnerável, busque
um Patch de Correção no deps.dev. Acesse a aba Security Advisories do portal para
identificar a versão mínima que mitiga a falha. Se houver uma versão estável disponível
sem Breaking Changes, execute a atualização imediatamente. Caso contrário, prossiga
para o Passo 3.
Passo 3 - Análise de Alcance (Reachability): Determine se a função especificamente
vulnerável é importada ou executada no código do projeto. Se a função não for utilizada e o
CVSS for inferior a 7.0, finalize o processo. Se a função não for utilizada, mas o CVSS for
superior a 7.0, o registro de Waiver é obrigatório. Se a função for utilizada, prossiga para o
## Passo 4.
## IMA • UFLA • FUNDECC


Passo 4 - Viabilidade de Alternativas: Para bibliotecas inativas ou vulneráveis com
funções alcançáveis, busque substitutas no socket.dev. A biblioteca substituta deve
obrigatoriamente apresentar paridade funcional e score de manutenção maior que 85. Se
encontrar uma alternativa viável, retorne ao Passo 1 com o novo pacote. Caso contrário,
siga para o Passo 5.
Passo 5 - Avaliação de Esforço: Realize o cálculo do esforço total estimado para a
correção técnica ou migração completa da biblioteca. Se o esforço for inferior a 16 horas, a
correção deve ser executada imediatamente. Se o esforço for superior a 16 horas, prossiga
para a definição do nível de governança no Passo 6.
Passo 6 - Triagem de Severidade Final: Avalie o impacto final com base no CVSS. Se o
CVSS estiver entre 7.1 e 9.0, o desenvolvedor deve registrar um Waiver comum no
OpenProject. Se o CVSS for superior a 9.0, o Escalonamento Crítico para o Time de
Segurança é obrigatório.
- Gestão de Waivers e Obsolescência

Toda biblioteca vulnerável ou sem manutenção mantida exige justificativa formal no Git e no
OpenProject com a tag Segurança.
No Git (Commit)
A descrição do commit deve seguir este modelo:
Waiver de Segurança: [CVE-ID ou Obsolescência] Justificativa:
[Vulnerabilidade de baixo impacto / Custo de migração elevado / Falta de
alternativa viável]. Status: Função não exposta ou isolada. Prazo de
Reavaliação: Máximo 10 dias.
Waiver de Segurança: [CVE-ID] Justificativa: Biblioteca mantida por ser
inalcançável no contexto atual. Status: not_affected (Função não importada).
Registro obrigatório para checagem periódica de integridade. Prazo de
Reavaliação: Máximo 10 dias.
No OpenProject (Rastreabilidade)
O desenvolvedor deve criar um Work Package para auditoria do débito técnico:
● Tipo: Tarefa ou Bug.
● Assunto: [WAIVER] - [NOME_DA_BIBLIOTECA] - [CVE-ID].
● Descrição: Justificativa técnica detalhada + Link para o commit no Git.
● Categoria: Adicionar Segurança e Waiver.
● Finalização: Prazo de reavaliação não superior a 10 dias.

## IMA • UFLA • FUNDECC


Tabela de Campos do Waiver
Campo no
OpenProject
Conteúdo Obrigatório Finalidade de Auditoria
Descrição Justificativa técnica + Análise de
## Alcance.
Justificar o risco aceito.
Versão Versão atual da biblioteca vulnerável. Controle de inventário.
Atribuído a Desenvolvedor responsável pela
análise.
Responsabilidade técnica.
Custom Field (Link) Link para o Commit no Git. Rastreabilidade do código.

## IMA • UFLA • FUNDECC


## 5. Escalonamento Crítico
Este processo é uma trava de governança para riscos de alta severidade.
- Gatilho: Ativado sempre que a severidade for maior que 9.0 ou a obsolescência
afetar bibliotecas centrais.
- Workflow: Altere o status no OpenProject para [Em Revisão].
- Revisão Obrigatória: O Time de Segurança deve revisar a análise de alcance e o
cálculo de esforço.
- Aprovação: O Waiver só é válido após o comentário de aprovação do revisor no
OpenProject, confirmando que a função é inativa ou que não há alternativas.
Template para Comentário de Aprovação
O revisor deve copiar, preencher e publicar o seguinte modelo no ticket:
Parecer Técnico de Escalonamento Crítico
Validação de Alcance: Confirmo que a análise de Reachability foi executada
e a função vulnerável é de fato inativa ou isolada no contexto do GEDAI.
Validação de Esforço: O cálculo de esforço estimado em [X] horas foi
auditado e considerado condizente com a complexidade técnica da remediação.
Análise de Alternativas: Validei a inexistência de Alternativas Viáveis com
paridade funcional imediata no Snyk Advisor.
● Decisão: APROVADO para uso temporário sob regime de Waiver.
Prazo de Reavaliação: 10 dias.

## IMA • UFLA • FUNDECC