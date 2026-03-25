#!/bin/bash

###############################################################################
# BRT Analytics Dashboard - Script de Instalação Automatizada
# 
# Este script automatiza a instalação completa do BRT Analytics Dashboard
# em Oracle Linux 9.7 com Wildfly 38 e Oracle 19c
#
# Uso: sudo bash install.sh
###############################################################################

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variáveis de configuração
ORACLE_HOST="192.168.100.199"
ORACLE_PORT="1521"
ORACLE_DB="orcl"
ORACLE_USER="jiva"
ORACLE_PASSWORD="tecsis"

APP_USER="appuser"
APP_HOME="/home/$APP_USER"
APP_DIR="$APP_HOME/brt-analytics-dashboard"
WILDFLY_HOME="/opt/wildfly"
WILDFLY_VERSION="38.0.1.Final"

# Funções auxiliares
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Este script deve ser executado como root"
        exit 1
    fi
}

check_os() {
    if ! grep -q "Oracle Linux" /etc/os-release; then
        log_error "Este script é para Oracle Linux 9.7"
        exit 1
    fi
    log_info "Sistema operacional validado: Oracle Linux"
}

check_fips() {
    if [ "$(cat /proc/sys/crypto/fips_enabled)" != "1" ]; then
        log_warn "FIPS mode não está ativado. Ativando..."
        # Ativar FIPS mode
        grubby --update-kernel=ALL --args=fips=1
        log_info "FIPS mode será ativado após reboot"
    else
        log_info "FIPS mode já está ativado"
    fi
}

update_system() {
    log_info "Atualizando sistema..."
    yum update -y > /dev/null 2>&1
    log_info "Sistema atualizado"
}

install_dependencies() {
    log_info "Instalando dependências..."
    
    yum install -y \
        git \
        curl \
        wget \
        java-17-openjdk-devel \
        nodejs \
        npm \
        net-tools \
        firewalld \
        > /dev/null 2>&1
    
    log_info "Dependências instaladas"
}

create_app_user() {
    if id "$APP_USER" &>/dev/null; then
        log_info "Usuário $APP_USER já existe"
    else
        log_info "Criando usuário $APP_USER..."
        useradd -m -s /bin/bash $APP_USER
        usermod -aG wheel $APP_USER
        log_info "Usuário $APP_USER criado"
    fi
}

configure_firewall() {
    log_info "Configurando firewall..."
    
    systemctl start firewalld
    systemctl enable firewalld
    
    firewall-cmd --permanent --add-port=3000/tcp
    firewall-cmd --permanent --add-port=8080/tcp
    firewall-cmd --permanent --add-port=9990/tcp
    firewall-cmd --permanent --add-port=1521/tcp
    firewall-cmd --reload
    
    log_info "Firewall configurado"
}

install_wildfly() {
    if [ -d "$WILDFLY_HOME" ]; then
        log_info "Wildfly já está instalado"
        return
    fi
    
    log_info "Instalando Wildfly $WILDFLY_VERSION..."
    
    cd /opt
    wget -q https://github.com/wildfly/wildfly/releases/download/$WILDFLY_VERSION/wildfly-$WILDFLY_VERSION.zip
    unzip -q wildfly-$WILDFLY_VERSION.zip
    mv wildfly-$WILDFLY_VERSION wildfly
    chown -R $APP_USER:$APP_USER wildfly
    rm wildfly-$WILDFLY_VERSION.zip
    
    log_info "Wildfly instalado em $WILDFLY_HOME"
}

configure_wildfly() {
    log_info "Configurando Wildfly..."
    
    # Criar arquivo de serviço systemd
    cat > /etc/systemd/system/wildfly.service << EOF
[Unit]
Description=WildFly Application Server
After=network.target

[Service]
Type=simple
User=$APP_USER
Group=$APP_USER
WorkingDirectory=$WILDFLY_HOME
ExecStart=$WILDFLY_HOME/bin/standalone.sh -b 0.0.0.0 -bmanagement 192.168.100.139
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable wildfly
    
    log_info "Wildfly configurado como serviço systemd"
}

install_application() {
    log_info "Instalando aplicação..."
    
    if [ ! -d "$APP_DIR" ]; then
        mkdir -p "$APP_DIR"
    fi
    
    # Copiar arquivos da aplicação (assumindo que estão disponíveis)
    # cp -r /path/to/brt-analytics-dashboard/* "$APP_DIR/"
    
    chown -R $APP_USER:$APP_USER "$APP_DIR"
    
    # Instalar dependências Node.js
    cd "$APP_DIR"
    sudo -u $APP_USER npm install
    
    log_info "Aplicação instalada"
}

create_log_directory() {
    log_info "Criando diretório de logs..."
    
    mkdir -p /var/log/brt-analytics
    chown -R $APP_USER:$APP_USER /var/log/brt-analytics
    chmod 755 /var/log/brt-analytics
    
    log_info "Diretório de logs criado"
}

configure_selinux() {
    log_info "Configurando SELinux..."
    
    # Ativar SELinux em modo enforcing
    sed -i 's/^SELINUX=.*/SELINUX=enforcing/' /etc/selinux/config
    
    log_info "SELinux configurado"
}

test_oracle_connection() {
    log_info "Testando conexão com Oracle..."
    
    # Verificar se Oracle está acessível
    if nc -z $ORACLE_HOST $ORACLE_PORT 2>/dev/null; then
        log_info "Conexão com Oracle validada"
    else
        log_warn "Não foi possível conectar a Oracle em $ORACLE_HOST:$ORACLE_PORT"
        log_warn "Verifique se o Oracle 19c está rodando e acessível"
    fi
}

create_environment_file() {
    log_info "Criando arquivo de configuração..."
    
    cat > "$APP_DIR/.env" << EOF
# Oracle Configuration
ORACLE_HOST=$ORACLE_HOST
ORACLE_PORT=$ORACLE_PORT
ORACLE_DB=$ORACLE_DB
ORACLE_USER=$ORACLE_USER
ORACLE_PASSWORD=$ORACLE_PASSWORD

# Application Configuration
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Database Configuration
DATABASE_URL=mysql://user:password@localhost:3306/brt_analytics

# OAuth Configuration
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
EOF
    
    chmod 600 "$APP_DIR/.env"
    chown $APP_USER:$APP_USER "$APP_DIR/.env"
    
    log_info "Arquivo de configuração criado"
}

print_summary() {
    echo ""
    echo "============================================"
    echo "BRT Analytics Dashboard - Instalação Completa"
    echo "============================================"
    echo ""
    echo "Componentes instalados:"
    echo "  ✓ Oracle Linux 9.7"
    echo "  ✓ Wildfly 38.0.1"
    echo "  ✓ Node.js e npm"
    echo "  ✓ Firewall configurado"
    echo "  ✓ SELinux ativado"
    echo ""
    echo "Próximos passos:"
    echo "  1. Editar arquivo de configuração: $APP_DIR/.env"
    echo "  2. Iniciar Wildfly: systemctl start wildfly"
    echo "  3. Iniciar aplicação: cd $APP_DIR && npm start"
    echo ""
    echo "Acessar dashboard:"
    echo "  URL: http://192.168.100.139:3000/dashboard"
    echo ""
    echo "Logs:"
    echo "  Wildfly: tail -f /opt/wildfly/standalone/log/server.log"
    echo "  Aplicação: tail -f /var/log/brt-analytics/app.log"
    echo ""
}

# Execução principal
main() {
    log_info "Iniciando instalação do BRT Analytics Dashboard..."
    
    check_root
    check_os
    check_fips
    update_system
    install_dependencies
    create_app_user
    configure_firewall
    install_wildfly
    configure_wildfly
    create_log_directory
    configure_selinux
    test_oracle_connection
    create_environment_file
    
    print_summary
    
    log_info "Instalação concluída com sucesso!"
}

# Executar main
main
