import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Users, Package, DollarSign, AlertCircle, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function Dashboard() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(),
  });

  // Queries tRPC
  const { data: kpiData, isLoading: kpiLoading } = trpc.dashboard.getKPIs.useQuery({
    dataInicio: dateRange.start,
    dataFim: dateRange.end,
  });

  const { data: tendenciaData, isLoading: tendenciaLoading } = trpc.dashboard.getTendenciaVendas.useQuery({
    dataInicio: dateRange.start,
    dataFim: dateRange.end,
  });

  const { data: rankingData, isLoading: rankingLoading } = trpc.dashboard.getRankingEmpresas.useQuery({
    dataInicio: dateRange.start,
    dataFim: dateRange.end,
  });

  // Dados de fallback enquanto carrega
  const defaultKPIs = [
    { title: 'Faturamento Total', value: 'R$ 0', change: '0%', icon: DollarSign, color: 'bg-blue-500' },
    { title: 'Lucro Líquido', value: 'R$ 0', change: '0%', icon: TrendingUp, color: 'bg-green-500' },
    { title: 'Margem %', value: '0%', change: '0%', icon: Package, color: 'bg-purple-500' },
    { title: 'EBITDA', value: 'R$ 0', change: '0%', icon: Users, color: 'bg-orange-500' },
  ];

  const displayKPIs = kpiData ? [
    { title: 'Faturamento Total', value: `R$ ${(kpiData.faturamentoTotal / 1000000).toFixed(2)}M`, change: '+0%', icon: DollarSign, color: 'bg-blue-500' },
    { title: 'Lucro Líquido', value: `R$ ${(kpiData.lucroLiquido / 1000000).toFixed(2)}M`, change: '+0%', icon: TrendingUp, color: 'bg-green-500' },
    { title: 'Margem %', value: `${(kpiData.margemPercentual || 0).toFixed(2)}%`, change: '+0%', icon: Package, color: 'bg-purple-500' },
    { title: 'EBITDA', value: `R$ ${(kpiData.ebitda / 1000000).toFixed(2)}M`, change: '+0%', icon: Users, color: 'bg-orange-500' },
  ] : defaultKPIs;
  const displayTendencia = tendenciaData || [];
  const displayRankingEmpresas = rankingData || [];
  const displayRankingMarcas = rankingData || [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const isLoading = kpiLoading || tendenciaLoading || rankingLoading;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Executivo</h1>
          <p className="text-gray-600 mt-2">Visão consolidada de vendas, custos e estoque</p>
        </div>

        {/* Filtro de Data */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Período
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div>
              <label className="text-sm font-medium">Data Inicial</label>
              <input
                type="date"
                value={dateRange.start.toISOString().split('T')[0]}
                onChange={(e) => setDateRange({ ...dateRange, start: new Date(e.target.value) })}
                className="mt-1 px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data Final</label>
              <input
                type="date"
                value={dateRange.end.toISOString().split('T')[0]}
                onChange={(e) => setDateRange({ ...dateRange, end: new Date(e.target.value) })}
                className="mt-1 px-3 py-2 border rounded-md"
              />
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {displayKPIs.map((kpi: any, index: number) => {
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

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Carregando dados...</span>
          </div>
        )}

        {!isLoading && (
          <Tabs defaultValue="tendencia" className="space-y-4">
            <TabsList>
              <TabsTrigger value="tendencia">Tendência</TabsTrigger>
              <TabsTrigger value="rankings">Rankings</TabsTrigger>
              <TabsTrigger value="distribuicao">Distribuição</TabsTrigger>
            </TabsList>

            {/* Aba Tendência */}
            <TabsContent value="tendencia">
              <Card>
                <CardHeader>
                  <CardTitle>Tendência de Faturamento e Lucro</CardTitle>
                  <CardDescription>Comparativo mensal de faturamento vs lucro líquido</CardDescription>
                </CardHeader>
                <CardContent>
                  {displayTendencia.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={displayTendencia}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip formatter={(value: any) => `R$ ${(value / 1000).toFixed(0)}k`} />
                        <Legend />
                        <Line type="monotone" dataKey="faturamento" stroke="#3b82f6" name="Faturamento" />
                        <Line type="monotone" dataKey="lucro" stroke="#10b981" name="Lucro" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8 text-gray-500">Nenhum dado disponível</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Rankings */}
            <TabsContent value="rankings" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Ranking Empresas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Empresas</CardTitle>
                    <CardDescription>Faturamento e lucro por empresa</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {displayRankingEmpresas.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={displayRankingEmpresas}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip formatter={(value: any) => `R$ ${(value / 1000).toFixed(0)}k`} />
                          <Legend />
                          <Bar dataKey="faturamento" fill="#3b82f6" name="Faturamento" />
                          <Bar dataKey="lucro" fill="#10b981" name="Lucro" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-8 text-gray-500">Nenhum dado disponível</div>
                    )}
                  </CardContent>
                </Card>

                {/* Ranking Marcas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Marcas</CardTitle>
                    <CardDescription>Faturamento por marca</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {displayRankingMarcas.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={displayRankingMarcas}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip formatter={(value: any) => `R$ ${(value / 1000).toFixed(0)}k`} />
                          <Bar dataKey="faturamento" fill="#f59e0b" name="Faturamento" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-8 text-gray-500">Nenhum dado disponível</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Aba Distribuição */}
            <TabsContent value="distribuicao">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Vendas por Marca</CardTitle>
                  <CardDescription>Percentual de vendas por marca</CardDescription>
                </CardHeader>
                <CardContent>
                  {displayRankingMarcas && displayRankingMarcas.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={displayRankingMarcas}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip formatter={(value: any) => `R$ ${(value / 1000).toFixed(0)}k`} />
                        <Bar dataKey="faturamento" fill="#f59e0b" name="Faturamento" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8 text-gray-500">Nenhum dado disponível</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
