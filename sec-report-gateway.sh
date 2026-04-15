#!/bin/bash

REPORT_MD="sec-report.md"
GITLEAKS_JSON="gitleaks_temp.json"
TRIVY_JSON="trivy_temp.json"
SEMGREP_JSON="semgrep_temp.json"

echo "### Iniciando Varredura de Segurança Backend: $(date) ###"

# 1. Gitleaks
gitleaks detect -v --report-format json --report-path "$GITLEAKS_JSON" > /dev/null 2>&1

# 2. Trivy
trivy fs ./ --scanners vuln --pkg-types library --format json --output "$TRIVY_JSON" > /dev/null 2>&1

# 3. Semgrep (Java Configs)
semgrep scan \
  --quiet \
  --json \
  --output="$SEMGREP_JSON" \
  --config="p/java" \
  --config="p/owasp-top-ten" \
  --config="p/cwe-top-25" \
  --config="p/findsecbugs" \
  --config="p/r2c-security-audit" \
  --config="p/jwt" \
  --config="p/insecure-transport"

# 4. Consolidação
{
    echo "# Relatório Consolidado de Segurança - Backend"
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
