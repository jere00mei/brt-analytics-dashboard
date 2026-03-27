import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { BarChart3, TrendingUp, ShoppingCart, Package, Lock, Settings } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">BRT Analytics Dashboard</CardTitle>
              <CardDescription>Sistema de Business Intelligence para ERP Sankhya OM</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-center">
                Acesse o sistema para visualizar dashboards de vendas, financeiro, estoque e muito mais.
              </p>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => window.location.href = `https://api.manus.im/oauth/authorize?client_id=${process.env.VITE_APP_ID}&redirect_uri=${window.location.origin}/api/oauth/callback&response_type=code&scope=openid`}
              >
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bem-vindo, {user?.name || user?.email}!</h1>
              <p className="text-gray-600 mt-2">Selecione um dashboard para começar</p>
            </div>
            {user?.role === 'admin' && (
              <Button 
                variant="outline"
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Administração
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dashboard Executivo */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/dashboard')}>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <CardTitle>Dashboard Executivo</CardTitle>
              </div>
              <CardDescription>KPIs e indicadores principais</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Visualize faturamento total, lucro líquido, margem e EBITDA com gráficos comparativos.
              </p>
            </CardContent>
          </Card>

          {/* Visão Financeira */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/financeiro')}>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <CardTitle>Visão Financeira</CardTitle>
              </div>
              <CardDescription>DRE e análise de metas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Acompanhe receitas, despesas e atingimento de metas por empresa.
              </p>
            </CardContent>
          </Card>

          {/* Visão Comercial */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/comercial')}>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
                <CardTitle>Visão Comercial</CardTitle>
              </div>
              <CardDescription>Vendas e análise de clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Analise vendas por marca, vendedor, grupo e produto com funil de conversão.
              </p>
            </CardContent>
          </Card>

          {/* Visão Operacional */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/operacional')}>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-6 w-6 text-orange-600" />
                <CardTitle>Visão Operacional</CardTitle>
              </div>
              <CardDescription>Estoque e giro de produtos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Monitore giro de estoque, produtos parados, risco de ruptura e análise Pareto.
              </p>
            </CardContent>
          </Card>

          {/* Sistema de Limites */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/limites')}>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-6 w-6 text-red-600" />
                <CardTitle>Liberação de Limites</CardTitle>
              </div>
              <CardDescription>Gestão de crédito</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Gerencie liberação de limites com alertas visuais e drill-down por cliente.
              </p>
            </CardContent>
          </Card>

          {/* Administração (apenas para admins) */}
          {user?.role === 'admin' && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin')}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-6 w-6 text-gray-600" />
                  <CardTitle>Administração</CardTitle>
                </div>
                <CardDescription>Gerenciar usuários e permissões</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Crie usuários, gerencie permissões de acesso aos dashboards e visualize auditoria.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-gray-600 text-sm">
          <p>BRT Analytics Dashboard © 2026 | Sistema integrado ao ERP Sankhya OM</p>
        </div>
      </div>
    </div>
  );
}
