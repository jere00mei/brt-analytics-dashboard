import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

export default function FinancialView() {
  const [selectedCompany, setSelectedCompany] = useState('all');

  // Dados de exemplo para DRE
  const dreData = [
    { item: 'Receita Bruta', valor: 2450000, percentual: 100 },
    { item: 'Devoluções', valor: -122500, percentual: -5 },
    { item: 'Receita Líquida', valor: 2327500, percentual: 95 },
    { item: 'CMV', valor: -1745625, percentual: -71.25 },
    { item: 'Lucro Bruto', valor: 581875, percentual: 23.75 },
    { item: 'Despesas Operacionais', valor: -122500, percentual: -5 },
    { item: 'EBITDA', valor: 704375, percentual: 28.75 },
    { item: 'Depreciação', valor: -49000, percentual: -2 },
    { item: 'EBIT', valor: 655375, percentual: 26.75 },
    { item: 'Juros', valor: -24500, percentual: -1 },
    { item: 'Lucro Líquido', valor: 490000, percentual: 20 },
  ];

  // Dados de exemplo para receita vs despesa
  const receivablesData = [
    { mes: 'Jan', receita: 180000, despesa: 135000, lucro: 45000 },
    { mes: 'Fev', receita: 220000, despesa: 165000, lucro: 55000 },
    { mes: 'Mar', receita: 200000, despesa: 150000, lucro: 50000 },
    { mes: 'Abr', receita: 280000, despesa: 210000, lucro: 70000 },
    { mes: 'Mai', receita: 290000, despesa: 217500, lucro: 72500 },
    { mes: 'Jun', receita: 310000, despesa: 232500, lucro: 77500 },
  ];

  // Dados de exemplo para metas
  const targetData = [
    { empresa: 'Empresa A', meta: 100, atingimento: 85 },
    { empresa: 'Empresa B', meta: 100, atingimento: 92 },
    { empresa: 'Empresa C', meta: 100, atingimento: 78 },
  ];

  // Dados de exemplo para inadimplência
  const inadimplenciaData = [
    { faixa: '0-30 dias', valor: 50000, percentual: 15 },
    { faixa: '31-60 dias', valor: 75000, percentual: 22 },
    { faixa: '61-90 dias', valor: 100000, percentual: 30 },
    { faixa: '90+ dias', valor: 125000, percentual: 33 },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#dc2626'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Visão Financeira</h1>
          <p className="text-gray-600 mt-2">Análise detalhada de receitas, despesas e rentabilidade por empresa</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="dre" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dre">DRE</TabsTrigger>
            <TabsTrigger value="receitas">Receitas vs Despesas</TabsTrigger>
            <TabsTrigger value="metas">Metas</TabsTrigger>
            <TabsTrigger value="inadimplencia">Inadimplência</TabsTrigger>
          </TabsList>

          {/* DRE */}
          <TabsContent value="dre" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Resumo DRE */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-sm">Resumo DRE</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Receita Bruta</span>
                      <span className="font-semibold">R$ 2.450.000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>CMV</span>
                      <span className="font-semibold">R$ 1.745.625</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span>Lucro Bruto</span>
                      <span className="font-semibold text-green-600">R$ 581.875</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Despesas Op.</span>
                      <span className="font-semibold">R$ 122.500</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span>EBITDA</span>
                      <span className="font-semibold text-blue-600">R$ 704.375</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Depreciação</span>
                      <span className="font-semibold">R$ 49.000</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span>EBIT</span>
                      <span className="font-semibold text-blue-600">R$ 655.375</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Juros</span>
                      <span className="font-semibold">R$ 24.500</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2 bg-green-50 p-2 rounded">
                      <span className="font-bold">Lucro Líquido</span>
                      <span className="font-bold text-green-600">R$ 490.000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabela DRE Detalhada */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Demonstração de Resultado - Detalhado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-2">Item</th>
                          <th className="text-right py-2">Valor</th>
                          <th className="text-right py-2">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dreData.map((row, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                            <td className="py-2 font-medium">{row.item}</td>
                            <td className="text-right py-2">R$ {row.valor.toLocaleString('pt-BR')}</td>
                            <td className="text-right py-2">{row.percentual.toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Receitas vs Despesas */}
          <TabsContent value="receitas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Evolução de Receitas e Despesas</CardTitle>
                <CardDescription>Últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={receivablesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="receita" fill="#3b82f6" name="Receita" />
                    <Bar dataKey="despesa" fill="#ef4444" name="Despesa" />
                    <Line type="monotone" dataKey="lucro" stroke="#10b981" name="Lucro" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Análise de Margem */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Margem Bruta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">23.75%</div>
                  <p className="text-xs text-gray-600 mt-1">+2.1% vs mês anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Margem EBITDA</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">28.75%</div>
                  <p className="text-xs text-gray-600 mt-1">+1.5% vs mês anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Margem Líquida</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">20%</div>
                  <p className="text-xs text-gray-600 mt-1">+0.8% vs mês anterior</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Metas */}
          <TabsContent value="metas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Atingimento de Metas por Empresa</CardTitle>
                <CardDescription>Percentual de atingimento da meta mensal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {targetData.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{item.empresa}</span>
                        <span className="text-sm font-semibold">{item.atingimento}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            item.atingimento >= 100
                              ? 'bg-green-500'
                              : item.atingimento >= 80
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

          {/* Inadimplência */}
          <TabsContent value="inadimplencia" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Inadimplência</CardTitle>
                  <CardDescription>Por faixa de atraso</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={inadimplenciaData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ faixa, percentual }) => `${faixa}: ${percentual}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="percentual"
                      >
                        {inadimplenciaData.map((entry, index) => (
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
                  <CardTitle>Detalhes de Inadimplência</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {inadimplenciaData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.faixa}</p>
                          <p className="text-sm text-gray-600">R$ {item.valor.toLocaleString('pt-BR')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">{item.percentual}%</p>
                          {idx > 2 && (
                            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3 h-3" />
                              Crítico
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
