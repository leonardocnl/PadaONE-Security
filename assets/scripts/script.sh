#!/usr/bin/env bash

set -euo pipefail

LOCAL_BIN="${HOME}/.local/bin"

log() {
  printf "\n[setup] %s\n" "$1"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Erro: comando obrigatorio nao encontrado: $1"
    exit 1
  fi
}

install_to_local_bin() {
  local bin_name="$1"
  local source_path="$2"

  mkdir -p "${LOCAL_BIN}"
  install -m 0755 "${source_path}" "${LOCAL_BIN}/${bin_name}"
}

latest_github_tag() {
  local repo="$1"
  local tag

  tag="$(wget -qO- "https://api.github.com/repos/${repo}/releases/latest" | sed -n 's/.*"tag_name": "\([^"]*\)".*/\1/p' | head -n1)"
  if [[ -z "${tag}" ]]; then
    echo "Erro: nao foi possivel obter a versao mais recente de ${repo}" >&2
    exit 1
  fi

  echo "${tag#v}"
}

bootstrap_python_and_pipx() {
  if command -v pipx >/dev/null 2>&1; then
    return
  fi

  log "Aviso: pipx ausente. Semgrep nao sera instalado neste script."
  echo "Instale manualmente antes de rodar novamente:"
  echo "  Ubuntu/Debian: apt-get update && apt-get install -y python3 pipx"
}

SEMGREP_INSTALLED=0

log "Validando pré-requisitos"
require_cmd wget
require_cmd tar
require_cmd install
require_cmd sed
require_cmd head

if [[ ":${PATH}:" != *":${LOCAL_BIN}:"* ]]; then
  export PATH="${LOCAL_BIN}:${PATH}"
fi

TRIVY_VERSION="$(latest_github_tag aquasecurity/trivy)"
TRIVY_TAR="trivy_${TRIVY_VERSION}_Linux-64bit.tar.gz"

log "Instalando Trivy ${TRIVY_VERSION} via release oficial"
wget -q "https://github.com/aquasecurity/trivy/releases/download/v${TRIVY_VERSION}/${TRIVY_TAR}"
tar -xf "${TRIVY_TAR}" trivy
install_to_local_bin trivy trivy
rm -f "${TRIVY_TAR}" trivy

log "Instalando Semgrep"
bootstrap_python_and_pipx

if command -v pipx >/dev/null 2>&1; then
  pipx ensurepath
  pipx install semgrep || pipx upgrade semgrep || true
  if command -v semgrep >/dev/null 2>&1; then
    SEMGREP_INSTALLED=1
  fi
else
  log "Aviso: Semgrep nao foi instalado (pipx ausente)."
fi

GITLEAKS_VERSION="8.24.0"
GITLEAKS_TAR="gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz"

log "Instalando Gitleaks ${GITLEAKS_VERSION}"
wget -q "https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/${GITLEAKS_TAR}"
tar -xf "${GITLEAKS_TAR}"
install_to_local_bin gitleaks gitleaks
rm -f "${GITLEAKS_TAR}" LICENSE README.md

log "      Validação das versões"
echo "----------------------------------------------------------"
if [[ "${SEMGREP_INSTALLED}" -eq 1 ]]; then
  echo "Semgrep: $(semgrep --version)"
else
  echo "Semgrep: nao instalado"
fi
echo "Gitleaks: $(gitleaks --version)"
echo "Trivy: $(trivy --version)"

cat <<EOF

SUCESSO! Configuração concluída.
Binários instalados em: ${LOCAL_BIN}
Se necessário, adicione ao PATH:
  export PATH="${LOCAL_BIN}:\$PATH"

Próximo passo obrigatório para Semgrep Pro Engine:
  semgrep login

EOF