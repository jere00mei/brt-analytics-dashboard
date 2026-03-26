import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react';

export default function LimitsView() {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // Dados de exemplo para limites bloqueados
  const limitesAguardando = [
    {
      id: 1,
      cliente: 'Cliente A',
      empresa: 'Empresa 1',
      valor_solicitado: 50000,
      limite_atual: 30000,
      dias_pendente: 5,
      status: 'Aguardando Análise',
      motivo: 'Limite insuficiente para pedido',
    },
    {
      id: 2,
      cliente: 'Cliente B',
      empresa: 'Empresa 2',
      valor_solicitado: 75000,
      limite_atual: 50000,
      dias_pendente: 3,
      status: 'Aguardando Análise',
      motivo: 'Limite insuficiente para pedido',
    },
    {
      id: 3,
      cliente: 'Cliente C',
      empresa: 'Empresa 1',
      valor_solicitado: 120000,
      limite_atual: 100000,
      dias_pendente: 8,
      status: 'Crítico',
      motivo: 'Pendência antiga - análise necessária',
    },
  ];

  // Dados de exemplo para histórico de liberações
  const historicoLiberacoes = [
    { mes: 'Jan', liberadas: 5, negadas: 2, valor_liberado: 250000 },
    { mes: 'Fev', liberadas: 8, negadas: 1, valor_liberado: 380000 },
    { mes: 'Mar', liberadas: 6, negadas: 3, valor_liberado: 290000 },
    { mes: 'Abr', liberadas: 9, negadas: 2, valor_liberado: 420000 },
    { mes: 'Mai', liberadas: 7, negadas: 1, valor_liberado: 340000 },
    { mes: 'Jun', liberadas: 10, negadas: 2, valor_liberado: 480000 },
  ];

  // Dados de exemplo para top clientes bloqueados
  const topClientesBloqueados = [
    { cliente: 'Cliente A', valor_bloqueado: 150000, dias_bloqueio: 15, motivo: 'Análise de crédito' },
    { cliente: 'Cliente D', valor_bloqueado: 200000, dias_bloqueio: 22, motivo: 'Inadimplência' },
    { cliente: 'Cliente E', valor_bloqueado: 120000, dias_bloqueio: 8, motivo: 'Limite insuficiente' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Liberação de Limites</h1>
          <p className="text-gray-600 mt-2">Gestão de limites de crédito e análise de pendências</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aguardando Análise</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-yellow-600 mt-1">Solicitações pendentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor em Análise</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 2.1M</div>
              <p className="text-xs text-blue-600 mt-1">Total sob análise</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Críticos (8+ dias)</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-red-600 mt-1">Requerem ação imediata</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Liberadas (Mês)</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">10</div>
              <p className="text-xs text-green-600 mt-1">R$ 480.000 liberados</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pendencias" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pendencias">Pendências</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="bloqueados">Top Bloqueados</TabsTrigger>
          </TabsList>

          {/* Pendências */}
          <TabsContent value="pendencias" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Solicitações Aguardando Análise</CardTitle>
                <CardDescription>Grade de ação para liberação ou negação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {limitesAguardando.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 border rounded-lg ${
                        item.dias_pendente > 7
                          ? 'border-red-300 bg-red-50'
                          : item.dias_pendente > 3
                          ? 'border-yellow-300 bg-yellow-50'
                          : 'border-blue-300 bg-blue-50'
                      }`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Informações */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{item.cliente}</h3>
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                item.dias_pendente > 7
                                  ? 'bg-red-200 text-red-700'
                                  : item.dias_pendente > 3
                                  ? 'bg-yellow-200 text-yellow-700'
                                  : 'bg-blue-200 text-blue-700'
                              }`}
                            >
                              {item.dias_pendente} dias
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Empresa: {item.empresa}</p>
                          <p className="text-sm text-gray-600">Motivo: {item.motivo}</p>
                          <div className="mt-3 space-y-1">
                            <p className="text-sm">
                              <span className="font-medium">Limite Atual:</span> R$ {item.limite_atual.toLocaleString('pt-BR')}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Solicitado:</span> R$ {item.valor_solicitado.toLocaleString('pt-BR')}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Diferença:</span> R$ {(item.valor_solicitado - item.limite_atual).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex flex-col justify-between">
                          <div className="mb-4">
                            <p className="text-sm font-semibold mb-2">Análise de Risco:</p>
                            <div className="space-y-1 text-sm">
                              <p>✓ Histórico de pagamento: Bom</p>
                              <p>✓ Faturamento: Crescente</p>
                              <p>⚠ Inadimplência: Baixa</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => setSelectedAction(`negar-${item.id}`)}
                            >
                              Negar
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => setSelectedAction(`liberar-${item.id}`)}
                            >
                              Liberar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Histórico */}
          <TabsContent value="historico" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Liberações</CardTitle>
                <CardDescription>Últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={historicoLiberacoes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="liberadas" fill="#10b981" name="Liberadas" />
                    <Bar dataKey="negadas" fill="#ef4444" name="Negadas" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">81.4%</div>
                  <p className="text-xs text-gray-600 mt-1">52 de 64 solicitações</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Valor Liberado (Mês)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">R$ 480k</div>
                  <p className="text-xs text-gray-600 mt-1">10 liberações</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tempo Médio Análise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">2.4 dias</div>
                  <p className="text-xs text-gray-600 mt-1">Últimos 30 dias</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Top Bloqueados */}
          <TabsContent value="bloqueados" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Clientes com Limites Bloqueados</CardTitle>
                <CardDescription>Maiores valores sob bloqueio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-2">Cliente</th>
                        <th className="text-right py-2">Valor Bloqueado</th>
                        <th className="text-right py-2">Dias Bloqueio</th>
                        <th className="text-left py-2">Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topClientesBloqueados.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-3 font-medium">{item.cliente}</td>
                          <td className="text-right py-3 font-semibold">R$ {item.valor_bloqueado.toLocaleString('pt-BR')}</td>
                          <td className="text-right py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                item.dias_bloqueio > 20
                                  ? 'bg-red-100 text-red-700'
                                  : item.dias_bloqueio > 10
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {item.dias_bloqueio} dias
                            </span>
                          </td>
                          <td className="py-3">{item.motivo}</td>
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
