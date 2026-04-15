#!/bin/bash

REPORT_MD="sec-report.md"
GITLEAKS_JSON="gitleaks_temp.json"
TRIVY_JSON="trivy_temp.json"
SEMGREP_JSON="semgrep_temp.json"

echo "### Iniciando Varredura de Segurança Frontend: $(date) ###"

# 1. Gitleaks
gitleaks detect -v --report-format json --report-path "$GITLEAKS_JSON" > /dev/null 2>&1

# 2. Trivy
trivy fs ./ --scanners vuln --pkg-types library --format json --output "$TRIVY_JSON" > /dev/null 2>&1

# 3. Semgrep (JS/TS Configs)
semgrep scan \
  --quiet \
  --json \
  --output="$SEMGREP_JSON" \
  --config=p/typescript \
  --config=p/javascript \
  --config=p/nodejsscan \
  --config=p/owasp-top-ten \
  --config=p/security-audit \
  --config=p/r2c-security-audit \
  --config=p/supply-chain \
  --config=p/jwt \
  --config=p/insecure-transport \
  --config=p/cwe-top-25 \
  --config=p/default \
  --config=p/ci \
  --config=p/clientside-js \
  --max-target-bytes 0 \
  --timeout 0 \
  --no-git-ignore \
  --severity INFO \
  --severity WARNING \
  --severity ERROR

# 4. Consolidação
{
    echo "# Relatório Consolidado de Segurança - Frontend"
    echo "Data: $(date)"
    echo "## 1. Gitleaks (Secrets)"
    if [ -f "$GITLEAKS_JSON" ] && [ "$(cat "$GITLEAKS_JSON")" != "null" ] && [ -s "$GITLEAKS_JSON" ]; then
        jq -r '.[] | "- **Regra**: \(.Description)\n  - **Arquivo**: \(.File)\n  - **Linha**: \(.StartLine)"' "$GITLEAKS_JSON"
    else
        echo "Nenhum segredo exposto detectado."
    fi

    echo -e "\n## 2. Trivy (SCA - Bibliotecas)"
    if [ -f "$TRIVY_JSON" ] && [ -s "$TRIVY_JSON" ]; then
        jq -r '.Results[]? | .Vulnerabilities[]? | "- **ID**: \(.VulnerabilityID) | **Severidade**: \(.Severity) | **Pkg**: \(.PkgName)"' "$TRIVY_JSON"
    else
        echo "Nenhuma vulnerabilidade de biblioteca encontrada."
    fi

    echo -e "\n## 3. Semgrep (SAST)"
    if [ -f "$SEMGREP_JSON" ] && [ -s "$SEMGREP_JSON" ]; then
        jq -r '.results[] | "- [\(.extra.severity)] \(.check_id): \(.path) (Linha \(.start.line))"' "$SEMGREP_JSON"
    else
        echo "Nenhum problema de código estático detectado."
    fi
} > "$REPORT_MD"

# 5. Sumário no Terminal
echo "--------------------------------------------------"
echo "SUMÁRIO DE RESULTADOS"
echo "--------------------------------------------------"
[ -f "$GITLEAKS_JSON" ] && echo "Gitleaks: $(jq '. | length' "$GITLEAKS_JSON" 2>/dev/null || echo 0) segredos."
[ -f "$TRIVY_JSON" ] && echo "Trivy: $(jq '[.Results[]?.Vulnerabilities[]?] | length' "$TRIVY_JSON" 2>/dev/null || echo 0) vulnerabilidades."
[ -f "$SEMGREP_JSON" ] && echo "Semgrep: $(jq '.results | length' "$SEMGREP_JSON" 2>/dev/null || echo 0) issues."
echo "--------------------------------------------------"
echo "Relatório: $REPORT_MD"

rm -f "$GITLEAKS_JSON" "$TRIVY_JSON" "$SEMGREP_JSON"
