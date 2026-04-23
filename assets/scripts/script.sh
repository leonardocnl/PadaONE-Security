#!/usr/bin/env bash

set -euo pipefail

GITLEAKS_VERSION="8.18.4"
GITLEAKS_TAR="gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz"

log() {
  printf "\n[setup] %s\n" "$1"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Erro: comando obrigatorio nao encontrado: $1"
    exit 1
  fi
}

log "Validando pré-requisitos"
require_cmd sudo
require_cmd apt-get
require_cmd wget
require_cmd tar

log "Atualizando índices de pacotes"
sudo apt update

log "Instalando Trivy"
sudo apt-get install -y trivy

log "Instalando Semgrep via pipx"
sudo apt install -y pipx
pipx ensurepath
pipx install semgrep || true

log "Instalando Gitleaks ${GITLEAKS_VERSION}"
wget -q "https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/${GITLEAKS_TAR}"
tar -xf "${GITLEAKS_TAR}"
sudo mv gitleaks /usr/local/bin/
rm -f "${GITLEAKS_TAR}" LICENSE README.md

log "Validação das versões"
trivy --version
semgrep --version
gitleaks version

cat <<EOF

Configuração concluída.
Próximo passo obrigatório para Semgrep Pro Engine:
  semgrep login

EOF