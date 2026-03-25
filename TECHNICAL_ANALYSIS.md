# BRT Analytics Dashboard - Análise Técnica e Arquitetura

## 1. Visão Geral do Projeto

O **BRT Analytics Dashboard** é um sistema de Business Intelligence executivo e operacional integrado ao ERP Sankhya OM, desenvolvido para fornecer análises financeiras, comerciais e de estoque em tempo real para múltiplas empresas com diferentes segmentos.

### Objetivos Principais

O sistema deve fornecer uma visão consolidada de dados de múltiplas empresas em um único schema Oracle 19c, garantindo segregação de dados, performance otimizada e conformidade com padrões de segurança DISA STIG e ANSSI-BP-028.

### Escopo de Funcionalidades

O projeto compreende 10 funcionalidades obrigatórias que cobrem as dimensões executiva, financeira, comercial e operacional do negócio, com foco em análise de vendas, custos, estoque e liberação de limites.

---

## 2. Arquitetura Técnica

### 2.1 Camadas da Arquitetura

A arquitetura segue o padrão de três camadas com separação clara de responsabilidades:

| Camada | Tecnologia | Responsabilidade |
|--------|-----------|------------------|
| **Apresentação** | React 19 + Tailwind CSS 4 | Interface de usuário, dashboards, gráficos, filtros |
| **Aplicação** | Express 4 + tRPC 11 | Lógica de negócio, procedures, roteamento de dados |
| **Dados** | Oracle 19c + VIEWs + Índices | Persistência, queries otimizadas, segurança de dados |

### 2.2 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React + Tailwind)                  │
│  - Dashboards Executivo, Financeiro, Comercial, Operacional    │
│  - Filtros Hierárquicos (Data → Empresa → Marca → ...)         │
│  - Gráficos (Linha, Barras, Donut, Heatmap, Pareto, Gauge)     │
└────────────────────────┬────────────────────────────────────────┘
                         │ tRPC Calls (/api/trpc)
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│              Backend (Express + tRPC + Node.js)                 │
│  - Routers: dashboard, financeiro, comercial, operacional       │
│  - Procedures: queries otimizadas com bind variables            │
│  - Autenticação: Manus OAuth + Session Cookies                  │
│  - Cache: Redis (opcional para dados frequentes)                │
└────────────────────────┬────────────────────────────────────────┘
                         │ SQL Queries
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│           Oracle 19c (192.168.100.199:1521/orcl)                │
│  - VIEWs Otimizadas (Vendas, Custos, Estoque, Inadimplência)   │
│  - Materialized Views (KPIs complexos)                          │
│  - Índices (CODEMP, DTNEG, CODPROD, CODVEND, etc)              │
│  - Tabelas Base: TGFCAB, TGFITE, TGFFIN, TGFEST, TGFGIR, etc   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Componentes Principais

**Frontend:**
- Dashboard Executivo: KPI cards, gráficos de tendência, rankings
- Dashboard Financeiro: DRE, receitas vs despesas, gauge charts
- Dashboard Comercial: Vendas por dimensão, funil, heatmap
- Dashboard Operacional: Estoque, giro, alertas, Pareto
- Sistema de Liberação: Grade de ação, alertas, drill-down
- Análise de Giro: Taxa, cobertura, rankings

**Backend:**
- Router Dashboard: KPIs executivos
- Router Financeiro: DRE, metas, receitas
- Router Comercial: Vendas, funil, análises
- Router Operacional: Estoque, giro, alertas
- Router Liberação: Limites, aprovações
- Router Filtros: Dados hierárquicos

**Banco de Dados:**
- VW_DASH_BRT_VENDAS: Análise de vendas
- VW_DASH_BRT_CUSTOS_EMP: Custos por empresa
- VW_DASH_BRT_ESTOQUE: Análise de estoque
- VW_DASH_BRT_INADIMPLENCIA: Inadimplência
- VW_DASH_BRT_GIRO: Giro de produtos
- VW_DASH_BRT_LIMITES: Liberação de limites

---

## 3. Estratégia de Conexão Oracle 19c

### 3.1 Configuração de Conexão

```
Servidor: 192.168.100.199
Porta: 1521
SID/Service: orcl
Usuário: jiva
Senha: tecsis
```

### 3.2 Otimizações de Performance

**Bind Variables:** Todas as queries devem utilizar bind variables (`:param`) para permitir reutilização do plano de execução pelo Oracle.

```sql
-- ✅ Correto: Usa bind variables
SELECT * FROM TGFFIN 
WHERE CODEMP = :codemp 
  AND DTNEG BETWEEN :data_ini AND :data_fim;

-- ❌ Incorreto: String concatenation
SELECT * FROM TGFFIN 
WHERE CODEMP = ' || codemp || ' 
  AND DTNEG BETWEEN ' || data_ini || ' AND ' || data_fim;
```

**Materialized Views:** Para indicadores complexos que são consultados frequentemente, utilizar MViews com refresh agendado.

```sql
CREATE MATERIALIZED VIEW MV_DASH_KPI_MENSAL AS
SELECT 
  CODEMP, 
  TRUNC(DTNEG, 'MM') AS MES,
  SUM(VLRNOTA) AS FATURAMENTO,
  SUM(VLRLUCRO) AS LUCRO
FROM TGFCAB
GROUP BY CODEMP, TRUNC(DTNEG, 'MM');

-- Refresh agendado a cada 6 horas
BEGIN
  DBMS_MVIEW.REFRESH('MV_DASH_KPI_MENSAL', 'C');
END;
```

**Índices Estratégicos:** Garantir que campos de filtro estejam indexados para otimizar consultas.

```sql
CREATE INDEX idx_tgffin_codemp_dtneg ON TGFFIN(CODEMP, DTNEG);
CREATE INDEX idx_tgfcab_codemp_dtneg ON TGFCAB(CODEMP, DTNEG);
CREATE INDEX idx_tgfest_codemp_codprod ON TGFEST(CODEMP, CODPROD);
CREATE INDEX idx_tgfgir_codemp_codprod ON TGFGIR(CODEMP, CODPROD);
```

**Parallel Execution:** Para tabelas grandes, utilizar hints de paralelização com cautela.

```sql
SELECT /*+ PARALLEL(t, 4) */ * FROM TGFFIN t
WHERE CODEMP = :codemp AND DTNEG BETWEEN :data_ini AND :data_fim;
```

### 3.3 Segregação de Dados por Empresa

Todas as queries devem filtrar por `CODEMP` (código da empresa) para garantir que um gerente veja apenas dados de sua empresa.

```sql
-- VIEWs com WHERE clause robusta
CREATE OR REPLACE VIEW VW_VENDAS_EMPRESA AS
SELECT * FROM TGFCAB
WHERE CODEMP = :empresa_selecionada;

-- Procedures com parâmetro de empresa
CREATE OR REPLACE PROCEDURE sp_get_vendas(
  p_codemp IN NUMBER,
  p_data_ini IN DATE,
  p_data_fim IN DATE
) AS
BEGIN
  SELECT * FROM TGFCAB
  WHERE CODEMP = p_codemp
    AND DTNEG BETWEEN p_data_ini AND p_data_fim;
END;
```

---

## 4. Estrutura de VIEWs e Queries

### 4.1 VIEWs Principais

| VIEW | Descrição | Tabelas Base | Filtros Principais |
|------|-----------|--------------|-------------------|
| VW_DASH_BRT_VENDAS | Análise de vendas por dimensão | TGFCAB, TGFITE, TGFPRO, TGFGRU | CODEMP, DTNEG, CODVEND, CODPROD |
| VW_DASH_BRT_CUSTOS_EMP | Custos por empresa e produto | TGFCUS, TGFPRO, TGFGRU, TSIEMP | CODEMP, CODPROD, DTATUAL |
| VW_DASH_BRT_ESTOQUE | Análise de estoque disponível | TGFEST, TGFPRO, TGFGRU, TSIEMP | CODEMP, CODPROD, CONTROLE |
| VW_DASH_BRT_INADIMPLENCIA | Análise de inadimplência | TGFFIN, TGFPAR, TGFVEN, TSIEMP | CODEMP, STATUS, DTVENC |
| VW_DASH_BRT_GIRO | Análise de giro de produtos | TGFGIR, TGFGIR1, TGFPRO, TGFEST | CODEMP, CODPROD, MARCA |
| VW_DASH_BRT_LIMITES | Liberação de limites | TGFLIB, TSILIB, TSIEMP, TGFPAR | CODEMP, STATUS, DHBLOQUEIO |

### 4.2 Queries de KPIs

**Faturamento Total:**
```sql
SELECT SUM(VLRNOTA) AS FATURAMENTO_TOTAL
FROM TGFCAB
WHERE CODEMP = :codemp
  AND DTNEG BETWEEN :data_ini AND :data_fim
  AND TIPMOV IN ('V', 'D');
```

**Lucro Líquido:**
```sql
SELECT SUM(VLRLUCRO) AS LUCRO_LIQUIDO
FROM TGFCAB
WHERE CODEMP = :codemp
  AND DTNEG BETWEEN :data_ini AND :data_fim
  AND TIPMOV IN ('V', 'D');
```

**Margem %:**
```sql
SELECT 
  (SUM(VLRLUCRO) / SUM(VLRNOTA)) * 100 AS MARGEM_PERCENTUAL
FROM TGFCAB
WHERE CODEMP = :codemp
  AND DTNEG BETWEEN :data_ini AND :data_fim;
```

**EBITDA:**
```sql
SELECT 
  SUM(VLRLUCRO) + SUM(VLRDESPFIN) + SUM(VLRDESPIMPOST) AS EBITDA
FROM TGFCAB
WHERE CODEMP = :codemp
  AND DTNEG BETWEEN :data_ini AND :data_fim;
```

---

## 5. Design de Segurança

### 5.1 Segregação de Dados

- **Autenticação:** Manus OAuth com session cookies
- **Autorização:** Verificação de CODEMP no contexto do usuário
- **Row-Level Security:** VIEWs com WHERE cláusulas robustas
- **Column-Level Security:** Mascaramento de dados sensíveis

### 5.2 Conformidade DISA STIG

- **Auditoria:** Logging de todas as operações críticas
- **Criptografia:** TLS 1.2+ para comunicação
- **Senhas:** Política de senhas fortes (12+ caracteres, complexidade)
- **Acesso:** Princípio do menor privilégio

### 5.3 Conformidade ANSSI-BP-028

- **Hardening do SO:** Oracle Linux 9.7 em modo FIPS
- **Firewall:** Restrição de portas e protocolos
- **Monitoramento:** Logs centralizados e alertas
- **Backup:** Estratégia de backup e disaster recovery

---

## 6. Modelo de Dados

### 6.1 Tabelas Principais do Sankhya

| Tabela | Descrição | Campos Principais |
|--------|-----------|------------------|
| TSIEMP | Empresas | CODEMP, RAZAOSOCIAL, CGC |
| TGFCAB | Cabeçalho de Movimentação | NUNOTA, CODEMP, DTNEG, VLRNOTA, TIPMOV |
| TGFITE | Itens de Movimentação | NUNOTA, CODPROD, QTDNEG, VLRUNIT |
| TGFPRO | Produtos | CODPROD, DESCRPROD, MARCA, CODGRUPOPROD |
| TGFGRU | Grupos de Produtos | CODGRUPOPROD, DESCRGRUPOPROD |
| TGFEST | Estoque | CODPROD, CODEMP, ESTOQUE, RESERVADO |
| TGFGIR | Giro de Produtos | CODPROD, CODEMP, TAXA_GIRO, DIAS_COBERTURA |
| TGFGIR1 | Detalhes de Giro | CODPROD, CODEMP, PERIODO, QUANTIDADE |
| TGFFIN | Financeiro | NUFIN, CODEMP, DTNEG, DTVENC, VLRDESDOB |
| TGFLIB | Liberação de Limites | NUCHAVE, CODEMP, STATUS, DHBLOQUEIO |
| TGFVEN | Vendedores | CODVEND, APELIDO, CODEMP |
| TGFPAR | Parceiros/Clientes | CODPARC, RAZAOSOCIAL, NOMEPARC |
| TGFCUS | Custos | CODPROD, CODEMP, CUSMED, CUSGER, DTATUAL |
| TGFTOP | Tipo de Operação | CODTIPOPER, DESCROPER, GRUPO |

### 6.2 Relacionamentos

```
TSIEMP (1) ──── (N) TGFCAB
TSIEMP (1) ──── (N) TGFEST
TSIEMP (1) ──── (N) TGFFIN
TSIEMP (1) ──── (N) TGFLIB

TGFCAB (1) ──── (N) TGFITE
TGFPRO (1) ──── (N) TGFITE
TGFPRO (1) ──── (N) TGFEST
TGFPRO (1) ──── (N) TGFGIR
TGFPRO (1) ──── (N) TGFCUS

TGFGRU (1) ──── (N) TGFPRO
TGFVEN (1) ──── (N) TGFCAB
TGFPAR (1) ──── (N) TGFCAB
```

---

## 7. Tecnologias Utilizadas

| Componente | Tecnologia | Versão | Justificativa |
|-----------|-----------|--------|--------------|
| Frontend | React | 19 | Framework moderno com performance otimizada |
| Styling | Tailwind CSS | 4 | Utility-first CSS para desenvolvimento rápido |
| Backend | Express | 4 | Servidor HTTP leve e flexível |
| RPC | tRPC | 11 | Type-safe RPC com suporte a TypeScript end-to-end |
| Banco de Dados | Oracle | 19c | Compatibilidade com ERP Sankhya OM |
| ORM | Drizzle | 0.44 | Type-safe SQL builder com migrations |
| Gráficos | Recharts | 2.15 | Componentes React para visualização de dados |
| Autenticação | Manus OAuth | - | Integração nativa com plataforma Manus |
| Servidor de App | Wildfly | 38 | Application server Java compatível com JEE |
| SO | Oracle Linux | 9.7 FIPS | Certificado para conformidade com FIPS 140-2 |

---

## 8. Plano de Implementação

### Fase 1: Análise Técnica (Atual)
- Definição de arquitetura
- Planejamento de VIEWs e queries
- Estratégia de segurança

### Fase 2: Estruturas SQL
- Criação de VIEWs no Oracle
- Criação de índices
- Testes de performance

### Fase 3: Backend
- Implementação de routers tRPC
- Integração com Oracle 19c
- Procedures e queries otimizadas

### Fase 4: Frontend
- Desenvolvimento de dashboards
- Implementação de gráficos
- Filtros hierárquicos

### Fase 5: Scripts de Instalação
- Script de instalação Oracle Linux 9.7 FIPS
- Script de configuração Wildfly 38
- Script de deployment

### Fase 6: Documentação
- Documentação técnica em .docx
- Guia de instalação
- Guia de operação

### Fase 7: Testes e Auditoria
- Testes de funcionalidade
- Testes de performance
- Auditoria DISA STIG/ANSSI

### Fase 8: Entrega
- Entrega de todos os artefatos
- Validação final

---

## 9. Considerações de Performance

### 9.1 Otimizações de Query

- Utilizar bind variables para reutilização de plano
- Evitar SELECT * (especificar colunas necessárias)
- Utilizar índices em campos de filtro
- Implementar materialized views para KPIs complexos
- Usar parallelização para tabelas grandes (com cautela)

### 9.2 Caching

- Cache de dados frequentes (Redis)
- Invalidação inteligente de cache
- TTL apropriado para diferentes tipos de dados

### 9.3 Paginação

- Implementar paginação para listas grandes
- Lazy loading de dados
- Virtual scrolling para tabelas com muitos registros

---

## 10. Próximos Passos

A próxima fase envolverá o desenvolvimento detalhado das VIEWs e queries otimizadas no Oracle 19c, seguido pela implementação do backend e frontend conforme o plano de implementação definido acima.

