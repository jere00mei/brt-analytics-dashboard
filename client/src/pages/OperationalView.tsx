import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, TrendingUp, Package } from 'lucide-react';

export default function OperationalView() {
  // Dados de exemplo para giro de estoque
  const giroData = [
    { marca: 'Marca A', taxa_giro: 4.2, dias_cobertura: 87 },
    { marca: 'Marca B', taxa_giro: 3.8, dias_cobertura: 96 },
    { marca: 'Marca C', taxa_giro: 5.1, dias_cobertura: 72 },
  ];

  // Dados de exemplo para produtos parados (90+ dias)
  const produtosParados = [
    { produto: 'Produto A', dias: 145, estoque: 250, valor: 75000 },
    { produto: 'Produto B', dias: 128, estoque: 180, valor: 54000 },
    { produto: 'Produto C', dias: 112, estoque: 320, valor: 96000 },
    { produto: 'Produto D', dias: 98, estoque: 150, valor: 45000 },
  ];

  // Dados de exemplo para risco de ruptura (<10 dias)
  const riscoRuptura = [
    { produto: 'Produto X', dias_cobertura: 8, estoque: 50, demanda_diaria: 6 },
    { produto: 'Produto Y', dias_cobertura: 6, estoque: 120, demanda_diaria: 20 },
    { produto: 'Produto Z', dias_cobertura: 9, estoque: 45, demanda_diaria: 5 },
  ];

  // Dados de exemplo para Pareto 80/20
  const paretoData = [
    { produto: 'Prod 1', vendas: 450000, percentual: 28.1 },
    { produto: 'Prod 2', vendas: 320000, percentual: 20 },
    { produto: 'Prod 3', vendas: 280000, percentual: 17.5 },
    { produto: 'Prod 4', vendas: 180000, percentual: 11.2 },
    { produto: 'Prod 5', vendas: 120000, percentual: 7.5 },
    { produto: 'Outros', vendas: 220000, percentual: 15.7 },
  ];

  // Dados de exemplo para tendência de estoque
  const tendenciaEstoque = [
    { mes: 'Jan', valor_total: 850000, quantidade: 15000 },
    { mes: 'Fev', valor_total: 920000, quantidade: 16200 },
    { mes: 'Mar', valor_total: 880000, quantidade: 15800 },
    { mes: 'Abr', valor_total: 950000, quantidade: 17000 },
    { mes: 'Mai', valor_total: 920000, quantidade: 16500 },
    { mes: 'Jun', valor_total: 890000, quantidade: 16000 },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#dc2626', '#991b1b', '#7c3aed'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Visão Operacional</h1>
          <p className="text-gray-600 mt-2">Análise de estoque, giro de produtos e alertas operacionais</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total Estoque</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 890.000</div>
              <p className="text-xs text-gray-600 mt-1">-3.3% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos Parados</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-red-600 mt-1">+8 vs mês anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risco Ruptura</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-orange-600 mt-1">+3 vs mês anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa Giro Média</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.4x</div>
              <p className="text-xs text-green-600 mt-1">+0.3x vs mês anterior</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="giro" className="space-y-4">
          <TabsList>
            <TabsTrigger value="giro">Giro de Produtos</TabsTrigger>
            <TabsTrigger value="parados">Produtos Parados</TabsTrigger>
            <TabsTrigger value="ruptura">Risco de Ruptura</TabsTrigger>
            <TabsTrigger value="pareto">Pareto 80/20</TabsTrigger>
            <TabsTrigger value="tendencia">Tendência de Estoque</TabsTrigger>
          </TabsList>

          {/* Giro de Produtos */}
          <TabsContent value="giro" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Giro por Marca</CardTitle>
                <CardDescription>Renovação do estoque em vezes por ano</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {giroData.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <div>
                          <p className="font-medium">{item.marca}</p>
                          <p className="text-sm text-gray-600">Taxa de Giro: {item.taxa_giro.toFixed(1)}x</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{item.dias_cobertura} dias</p>
                          <p className="text-sm text-gray-600">de cobertura</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            item.taxa_giro >= 4
                              ? 'bg-green-500'
                              : item.taxa_giro >= 3
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min((item.taxa_giro / 5) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Produtos Parados */}
          <TabsContent value="parados" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Produtos Parados (90+ dias)</CardTitle>
                <CardDescription>Sem movimento há mais de 90 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-2">Produto</th>
                        <th className="text-right py-2">Dias Parado</th>
                        <th className="text-right py-2">Estoque</th>
                        <th className="text-right py-2">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {produtosParados.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-2 font-medium">{item.produto}</td>
                          <td className="text-right py-2">
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                              {item.dias} dias
                            </span>
                          </td>
                          <td className="text-right py-2">{item.estoque} un</td>
                          <td className="text-right py-2 font-semibold">R$ {item.valor.toLocaleString('pt-BR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risco de Ruptura */}
          <TabsContent value="ruptura" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Produtos com Risco de Ruptura</CardTitle>
                <CardDescription>Menos de 10 dias de cobertura</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riscoRuptura.map((item, idx) => (
                    <div key={idx} className="p-4 border-l-4 border-orange-500 bg-orange-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{item.produto}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Estoque: {item.estoque} un | Demanda: {item.demanda_diaria} un/dia
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-600">{item.dias_cobertura}</p>
                          <p className="text-xs text-gray-600">dias de cobertura</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pareto 80/20 */}
          <TabsContent value="pareto" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Curva ABC de Produtos</CardTitle>
                  <CardDescription>Análise Pareto 80/20</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={paretoData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ produto, percentual }) => `${produto}: ${percentual}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="percentual"
                      >
                        {paretoData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detalhes da Curva ABC</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-lg border-green-200 bg-green-50">
                      <p className="text-sm font-semibold text-green-700">Classe A (80%)</p>
                      <p className="text-xs text-gray-600 mt-1">3 produtos = 65.6% do faturamento</p>
                    </div>
                    <div className="p-3 border rounded-lg border-yellow-200 bg-yellow-50">
                      <p className="text-sm font-semibold text-yellow-700">Classe B (15%)</p>
                      <p className="text-xs text-gray-600 mt-1">2 produtos = 18.7% do faturamento</p>
                    </div>
                    <div className="p-3 border rounded-lg border-red-200 bg-red-50">
                      <p className="text-sm font-semibold text-red-700">Classe C (5%)</p>
                      <p className="text-xs text-gray-600 mt-1">1 produto = 15.7% do faturamento</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tendência de Estoque */}
          <TabsContent value="tendencia" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Evolução do Estoque</CardTitle>
                <CardDescription>Valor total e quantidade em estoque</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={tendenciaEstoque}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="valor_total" stroke="#3b82f6" name="Valor (R$)" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="quantidade" stroke="#10b981" name="Quantidade (un)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
