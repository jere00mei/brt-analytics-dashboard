import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Users, Package, DollarSign, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(),
  });

  // Dados de exemplo para KPIs
  const kpis = [
    {
      title: 'Faturamento Total',
      value: 'R$ 2.450.000',
      change: '+12.5%',
      icon: DollarSign,
      color: 'bg-blue-500',
    },
    {
      title: 'Lucro Líquido',
      value: 'R$ 612.500',
      change: '+8.3%',
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Margem %',
      value: '25%',
      change: '+2.1%',
      icon: Package,
      color: 'bg-purple-500',
    },
    {
      title: 'EBITDA',
      value: 'R$ 735.000',
      change: '+5.7%',
      icon: Users,
      color: 'bg-orange-500',
    },
  ];

  // Dados de exemplo para gráfico de tendência
  const tendenciaData = [
    { mes: 'Jan', faturamento: 180000, lucro: 45000 },
    { mes: 'Fev', faturamento: 220000, lucro: 55000 },
    { mes: 'Mar', faturamento: 200000, lucro: 50000 },
    { mes: 'Abr', faturamento: 280000, lucro: 70000 },
    { mes: 'Mai', faturamento: 290000, lucro: 72500 },
    { mes: 'Jun', faturamento: 310000, lucro: 77500 },
  ];

  // Dados de exemplo para ranking
  const rankingEmpresas = [
    { nome: 'Empresa A', faturamento: 850000, lucro: 212500 },
    { nome: 'Empresa B', faturamento: 720000, lucro: 180000 },
    { nome: 'Empresa C', faturamento: 880000, lucro: 220000 },
  ];

  // Dados de exemplo para distribuição
  const distribuicaoData = [
    { name: 'Marca A', value: 35 },
    { name: 'Marca B', value: 25 },
    { name: 'Marca C', value: 20 },
    { name: 'Marca D', value: 20 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Executivo</h1>
          <p className="text-gray-600 mt-2">Visão consolidada de vendas, custos e estoque</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                  <Icon className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <p className="text-xs text-green-600 mt-1">{kpi.change} vs período anterior</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs para diferentes visões */}
        <Tabs defaultValue="executiva" className="space-y-4">
          <TabsList>
            <TabsTrigger value="executiva">Executiva</TabsTrigger>
            <TabsTrigger value="financeira">Financeira</TabsTrigger>
            <TabsTrigger value="comercial">Comercial</TabsTrigger>
            <TabsTrigger value="operacional">Operacional</TabsTrigger>
            <TabsTrigger value="limites">Limites</TabsTrigger>
          </TabsList>

          {/* Visão Executiva */}
          <TabsContent value="executiva" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Gráfico de Tendência */}
              <Card>
                <CardHeader>
                  <CardTitle>Tendência de Vendas</CardTitle>
                  <CardDescription>Faturamento e Lucro vs Período Anterior</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={tendenciaData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="faturamento" stroke="#3b82f6" name="Faturamento" />
                      <Line type="monotone" dataKey="lucro" stroke="#10b981" name="Lucro" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Distribuição por Marca */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Receita</CardTitle>
                  <CardDescription>Por Marca</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={distribuicaoData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {distribuicaoData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Ranking de Empresas */}
            <Card>
              <CardHeader>
                <CardTitle>Ranking de Empresas</CardTitle>
                <CardDescription>Mais Rentáveis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={rankingEmpresas}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="faturamento" fill="#3b82f6" name="Faturamento" />
                    <Bar dataKey="lucro" fill="#10b981" name="Lucro" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visão Financeira */}
          <TabsContent value="financeira" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Demonstração de Resultado</CardTitle>
                <CardDescription>DRE Simplificada</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span>Receita Bruta</span>
                    <span className="font-semibold">R$ 2.450.000</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span>(-) CMV</span>
                    <span className="font-semibold">R$ 1.837.500</span>
                  </div>
                  <div className="flex justify-between border-b pb-2 bg-blue-50 p-2">
                    <span>Margem Bruta</span>
                    <span className="font-semibold">R$ 612.500</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span>(-) Despesas</span>
                    <span className="font-semibold">R$ 122.500</span>
                  </div>
                  <div className="flex justify-between bg-green-50 p-2 rounded">
                    <span className="font-bold">Lucro Líquido</span>
                    <span className="font-bold text-green-600">R$ 490.000</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visão Comercial */}
          <TabsContent value="comercial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Vendas</CardTitle>
                <CardDescription>Por Dimensão</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Análise de vendas por empresa, marca, vendedor, grupo e produto</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visão Operacional */}
          <TabsContent value="operacional" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Produtos Parados</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">42</div>
                  <p className="text-xs text-gray-600 mt-1">Mais de 90 dias sem movimento</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Risco de Ruptura</CardTitle>
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18</div>
                  <p className="text-xs text-gray-600 mt-1">Menos de 10 dias de cobertura</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa Média de Giro</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3.2x</div>
                  <p className="text-xs text-gray-600 mt-1">Renovação do estoque</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Visão de Limites */}
          <TabsContent value="limites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Liberação de Limites</CardTitle>
                <CardDescription>Pendências e Ações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">Cliente X - Limite Bloqueado</p>
                      <p className="text-sm text-gray-600">R$ 15.000 - Pendente há 3 dias</p>
                    </div>
                    <div className="space-x-2">
                      <Button size="sm" variant="outline">Negar</Button>
                      <Button size="sm">Liberar</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
