import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, Users, ShoppingCart } from 'lucide-react';

export default function CommercialView() {
  // Dados de exemplo para vendas por dimensão
  const vendasPorEmpresa = [
    { nome: 'Empresa A', vendas: 850000, crescimento: 12 },
    { nome: 'Empresa B', vendas: 720000, crescimento: 8 },
    { nome: 'Empresa C', vendas: 880000, crescimento: 15 },
  ];

  const vendasPorMarca = [
    { nome: 'Marca A', vendas: 650000, crescimento: 10 },
    { nome: 'Marca B', vendas: 580000, crescimento: 14 },
    { nome: 'Marca C', vendas: 420000, crescimento: 5 },
  ];

  const vendasPorVendedor = [
    { nome: 'Vendedor 1', vendas: 450000, meta: 400000, atingimento: 112 },
    { nome: 'Vendedor 2', vendas: 380000, meta: 400000, atingimento: 95 },
    { nome: 'Vendedor 3', vendas: 420000, meta: 400000, atingimento: 105 },
  ];

  // Dados de exemplo para funil de conversão
  const funilData = [
    { etapa: 'Leads', quantidade: 1000, percentual: 100 },
    { etapa: 'Oportunidades', quantidade: 450, percentual: 45 },
    { etapa: 'Propostas', quantidade: 180, percentual: 18 },
    { etapa: 'Fechadas', quantidade: 90, percentual: 9 },
  ];

  // Dados de exemplo para heatmap (atividades por dia/hora)
  const heatmapData = [
    { dia: 'Seg', manha: 45, tarde: 62, noite: 28 },
    { dia: 'Ter', manha: 52, tarde: 58, noite: 32 },
    { dia: 'Qua', manha: 48, tarde: 65, noite: 35 },
    { dia: 'Qui', manha: 61, tarde: 70, noite: 40 },
    { dia: 'Sex', manha: 55, tarde: 68, noite: 38 },
  ];

  // Dados de exemplo para clientes por vendedor
  const clientesPorVendedor = [
    { vendedor: 'Vendedor 1', clientes: 85, ticket_medio: 5294 },
    { vendedor: 'Vendedor 2', clientes: 72, ticket_medio: 5278 },
    { vendedor: 'Vendedor 3', clientes: 78, ticket_medio: 5385 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Visão Comercial</h1>
          <p className="text-gray-600 mt-2">Análise de vendas, funil de conversão e atividades comerciais</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 2.450.000</div>
              <p className="text-xs text-green-600 mt-1">+12.5% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 5.320</div>
              <p className="text-xs text-green-600 mt-1">+2.1% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">460</div>
              <p className="text-xs text-green-600 mt-1">+8.3% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">9%</div>
              <p className="text-xs text-red-600 mt-1">-1.2% vs mês anterior</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="vendas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="vendas">Vendas por Dimensão</TabsTrigger>
            <TabsTrigger value="funil">Funil de Conversão</TabsTrigger>
            <TabsTrigger value="heatmap">Heatmap de Atividades</TabsTrigger>
            <TabsTrigger value="clientes">Clientes por Vendedor</TabsTrigger>
          </TabsList>

          {/* Vendas por Dimensão */}
          <TabsContent value="vendas" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Vendas por Empresa */}
              <Card>
                <CardHeader>
                  <CardTitle>Vendas por Empresa</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={vendasPorEmpresa}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nome" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="vendas" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Vendas por Marca */}
              <Card>
                <CardHeader>
                  <CardTitle>Vendas por Marca</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={vendasPorMarca}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nome" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="vendas" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Vendas por Vendedor */}
            <Card>
              <CardHeader>
                <CardTitle>Vendas vs Meta por Vendedor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {vendasPorVendedor.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{item.nome}</span>
                        <span className="text-sm">
                          <span className="font-semibold">R$ {(item.vendas / 1000).toFixed(0)}k</span>
                          <span className="text-gray-600 ml-2">({item.atingimento}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            item.atingimento >= 100
                              ? 'bg-green-500'
                              : item.atingimento >= 90
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(item.atingimento, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Funil de Conversão */}
          <TabsContent value="funil" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Funil de Conversão</CardTitle>
                  <CardDescription>Evolução de leads até fechamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {funilData.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{item.etapa}</span>
                          <span className="text-sm font-semibold">{item.quantidade}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded h-8 flex items-center justify-center" style={{ width: `${item.percentual}%` }}>
                          <div className="bg-blue-500 rounded h-8 flex items-center justify-center text-white text-sm font-bold" style={{ width: '100%' }}>
                            {item.percentual}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Taxa de Conversão por Etapa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600">Leads → Oportunidades</p>
                      <p className="text-2xl font-bold text-green-600">45%</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600">Oportunidades → Propostas</p>
                      <p className="text-2xl font-bold text-yellow-600">40%</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600">Propostas → Fechadas</p>
                      <p className="text-2xl font-bold text-blue-600">50%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Heatmap de Atividades */}
          <TabsContent value="heatmap" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Heatmap de Atividades Comerciais</CardTitle>
                <CardDescription>Quantidade de contatos por período do dia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-2 px-2">Dia</th>
                        <th className="text-center py-2 px-2">Manhã</th>
                        <th className="text-center py-2 px-2">Tarde</th>
                        <th className="text-center py-2 px-2">Noite</th>
                      </tr>
                    </thead>
                    <tbody>
                      {heatmapData.map((row, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-2 px-2 font-medium">{row.dia}</td>
                          <td className="text-center py-2 px-2">
                            <span className="px-3 py-1 rounded text-white bg-blue-400">{row.manha}</span>
                          </td>
                          <td className="text-center py-2 px-2">
                            <span className="px-3 py-1 rounded text-white bg-orange-400">{row.tarde}</span>
                          </td>
                          <td className="text-center py-2 px-2">
                            <span className="px-3 py-1 rounded text-white bg-purple-400">{row.noite}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clientes por Vendedor */}
          <TabsContent value="clientes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Clientes e Ticket Médio por Vendedor</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="clientes" name="Clientes" />
                    <YAxis dataKey="ticket_medio" name="Ticket Médio" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Vendedores" data={clientesPorVendedor} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tabela de Detalhes */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes por Vendedor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-2">Vendedor</th>
                        <th className="text-right py-2">Clientes</th>
                        <th className="text-right py-2">Ticket Médio</th>
                        <th className="text-right py-2">Total Vendas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientesPorVendedor.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-2">{item.vendedor}</td>
                          <td className="text-right py-2">{item.clientes}</td>
                          <td className="text-right py-2">R$ {item.ticket_medio.toLocaleString('pt-BR')}</td>
                          <td className="text-right py-2 font-semibold">R$ {(item.clientes * item.ticket_medio).toLocaleString('pt-BR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
