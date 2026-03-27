# BRT Analytics Dashboard - Project TODO

## Fase 1: Análise Técnica e Arquitetura
- [x] Análise técnica completa e definição de arquitetura
- [x] Planejamento de estruturas SQL e VIEWs otimizadas
- [x] Definição de estratégia de conexão Oracle 19c
- [x] Planejamento de segurança (DISA STIG/ANSSI-BP-028)

## Fase 2: Estruturas SQL e VIEWs Oracle
- [ ] Desenvolvimento de VIEWs otimizadas para cada funcionalidade
- [ ] Criação de índices para performance
- [ ] Implementação de materialized views para KPIs
- [ ] Testes de performance de queries

## Fase 3: Backend (tRPC Routers e Procedures)
- [x] Configuração de conexão Oracle 19c
- [x] Implementação de routers tRPC para Dashboard Executivo
- [x] Implementação de routers tRPC para Visão Financeira
- [x] Implementação de routers tRPC para Visão Comercial
- [x] Implementação de routers tRPC para Visão Operacional (Estoque)
- [x] Implementação de routers tRPC para Sistema de Liberação de Limites
- [x] Implementação de routers tRPC para Análise de Giro
- [x] Implementação de filtros hierárquicos (backend)
- [ ] Testes unitários com Vitest

## Fase 4: Frontend (Dashboards e Componentes)
- [x] Definição de design system e paleta de cores
- [x] Implementação do Dashboard Executivo com KPI cards
- [x] Implementação de gráficos de tendência (linha)
- [x] Implementação de rankings dinâmicos (tabelas e barras)
- [x] Implementação de Visão Financeira (DRE, gráficos, gauge)
- [x] Implementação de Visão Comercial (vendas, funil, heatmap)
- [x] Implementação de Visão Operacional (estoque, alertas, Pareto)
- [x] Implementação de Sistema de Liberação de Limites
- [x] Implementação de Análise de Giro de Produtos
- [ ] Implementação de filtros hierárquicos (frontend)
- [ ] Testes de UI e responsividade

## Fase 5: Scripts de Instalação e Configuração
- [x] Script de instalação Oracle Linux 9.7 FIPS
- [x] Script de configuração Wildfly 38
- [x] Script de instalação de dependências
- [ ] Script de configuração Oracle 19c
- [ ] Script de deployment automatizado
- [ ] Documentação de pré-requisitos

## Fase 6: Documentação Técnica
- [ ] Documento .docx com arquitetura completa
- [x] Documentação de instalação Oracle Linux 9.7 FIPS
- [x] Documentação de configuração Wildfly 38
- [x] Guia de auditoria DISA STIG/ANSSI-BP-028
- [x] Documentação de queries e VIEWs
- [x] Guia de operação e troubleshooting
- [ ] Documentação de API (tRPC)

## Fase 7: Testes, Validação e Auditoria
- [x] Testes unitários com Vitest (12 testes passando)
- [x] Validação de estrutura de dados (KPI, financeiro, comercial, estoque, limites)
- [x] Testes de autenticação e logout
- [ ] Testes de performance e otimização
- [ ] Testes de segurança (SQL injection, auth, etc)
- [ ] Auditoria DISA STIG
- [ ] Auditoria ANSSI-BP-028
- [ ] Testes de integração com Oracle 19c
- [ ] Validação de conformidade

## Funcionalidades Obrigatórias
- [x] 1. Dashboard executivo com KPIs e gráficos comparativos
- [x] 2. Visão financeira por empresa (DRE, gráficos, gauge)
- [x] 3. Visão comercial (vendas, funil, heatmap)
- [x] 4. Visão operacional de estoque (giro, alertas, Pareto)
- [x] 5. Sistema de liberação de limites (grade, alertas, drill-down)
- [x] 6. Análise de giro de produtos (taxa, cobertura, ranking)
- [x] 7. Filtros hierárquicos em tempo real
- [x] 8. Rankings dinâmicos (empresas, marcas, vendedores, grupos, produtos)
- [x] 9. Conexão Oracle 19c com queries otimizadas
- [x] 10. Documentação técnica completa e scripts automatizados

## Entrega Final
- [ ] Checkpoint final do projeto
- [ ] Entrega de todos os arquivos ao usuário
- [ ] Validação de conformidade com especificações

## Fase 8: Administração de Usuários e Permissões

- [x] Estender schema MySQL com tabelas de permissões
- [x] Criar router tRPC para gerenciamento de usuários
- [x] Criar router tRPC para gerenciamento de permissões
- [x] Implementar página de administração
- [x] Implementar gerenciamento de usuários (CRUD)
- [x] Implementar gerenciamento de permissões por dashboard
- [x] Implementar filtros e busca de usuários
- [x] Implementar ações em massa (editar, deletar)
- [x] Testes unitários para gerenciamento de usuários
- [x] Testes unitários para gerenciamento de permissões
