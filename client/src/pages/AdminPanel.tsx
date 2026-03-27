import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Edit, Trash2, Lock, Users, LogOut } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function AdminPanel() {
  const [searchUser, setSearchUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedUserPermissions, setSelectedUserPermissions] = useState<any>(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  // Queries
  const { data: usersData, isLoading: usersLoading } = trpc.admin.listUsers.useQuery({
    page: 1,
    limit: 100,
    search: searchUser,
    role: selectedRole,
  });

  const { data: dashboards } = trpc.admin.getDashboards.useQuery();

  const { data: auditLog } = trpc.admin.getAuditLog.useQuery({
    page: 1,
    limit: 50,
    action: '',
  });

  // Mutations
  const updateUserMutation = trpc.admin.updateUser.useMutation();
  const deleteUserMutation = trpc.admin.deleteUser.useMutation();
  const updatePermissionMutation = trpc.admin.updateUserPermission.useMutation();
  const removePermissionMutation = trpc.admin.removeUserPermission.useMutation();

  // Handlers
  const handleUpdateUser = async (userId: number, data: any) => {
    try {
      await updateUserMutation.mutateAsync({
        userId,
        ...data,
      });
      setEditingUser(null);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm('Tem certeza que deseja deletar este usuário?')) {
      try {
        await deleteUserMutation.mutateAsync({ userId });
      } catch (error) {
        console.error('Erro ao deletar usuário:', error);
      }
    }
  };

  const handleUpdatePermission = async (userId: number, dashboardId: number, permissions: any) => {
    try {
      await updatePermissionMutation.mutateAsync({
        userId,
        dashboardId,
        ...permissions,
      });
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
    }
  };

  const handleRemovePermission = async (userId: number, dashboardId: number) => {
    if (confirm('Tem certeza que deseja remover esta permissão?')) {
      try {
        await removePermissionMutation.mutateAsync({ userId, dashboardId });
      } catch (error) {
        console.error('Erro ao remover permissão:', error);
      }
    }
  };

  const filteredUsers = useMemo(() => {
    if (!usersData?.data) return [];
    return usersData.data.filter((user: any) => {
      const matchSearch = !searchUser || user.email?.toLowerCase().includes(searchUser.toLowerCase());
      const matchRole = !selectedRole || user.role === selectedRole;
      return matchSearch && matchRole;
    });
  }, [usersData?.data, searchUser, selectedRole]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administração</h1>
          <p className="text-gray-600 mt-2">Gerenciar usuários e permissões de acesso aos dashboards</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="usuarios" className="space-y-4">
          <TabsList>
            <TabsTrigger value="usuarios" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="auditoria" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Auditoria
            </TabsTrigger>
          </TabsList>

          {/* Aba Usuários */}
          <TabsContent value="usuarios" className="space-y-4">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Buscar por Email</label>
                    <Input
                      placeholder="Digite o email..."
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Filtrar por Papel</label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione um papel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos</SelectItem>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Gerente</SelectItem>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Usuários */}
            <Card>
              <CardHeader>
                <CardTitle>Usuários do Sistema</CardTitle>
                <CardDescription>Total: {usersData?.total || 0} usuários</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">Carregando...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Nenhum usuário encontrado</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4">Email</th>
                          <th className="text-left py-3 px-4">Nome</th>
                          <th className="text-left py-3 px-4">Papel</th>
                          <th className="text-left py-3 px-4">Último Acesso</th>
                          <th className="text-right py-3 px-4">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user: any) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{user.email}</td>
                            <td className="py-3 px-4">{user.name || '-'}</td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={user.role === 'admin' ? 'default' : 'secondary'}
                              >
                                {user.role}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              {new Date(user.lastSignedIn).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedUserPermissions(user);
                                    setShowPermissionDialog(true);
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  <Lock className="h-3 w-3" />
                                  Permissões
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingUser(user)}
                                  className="flex items-center gap-1"
                                >
                                  <Edit className="h-3 w-3" />
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="flex items-center gap-1"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Deletar
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Auditoria */}
          <TabsContent value="auditoria" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Log de Auditoria</CardTitle>
                <CardDescription>Histórico de ações no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                {!auditLog?.data || auditLog.data.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Nenhum registro de auditoria</div>
                ) : (
                  <div className="space-y-4">
                    {auditLog.data.map((log: any, idx: number) => (
                      <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{log.action}</Badge>
                              <span className="text-sm text-gray-600">
                                {new Date(log.createdAt).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Recurso:</span> {log.resource}
                            </p>
                            {log.details && (
                              <p className="text-xs text-gray-500 mt-2">
                                {log.details}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog de Permissões */}
        <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
          <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gerenciar Permissões</DialogTitle>
              <DialogDescription>
                Usuário: {selectedUserPermissions?.email}
              </DialogDescription>
            </DialogHeader>

            {dashboards && dashboards.length > 0 ? (
              <div className="space-y-4">
                {dashboards.map((dashboard: any) => (
                  <div key={dashboard.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{dashboard.name}</h4>
                        <p className="text-sm text-gray-600">{dashboard.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <label className="flex items-center gap-2">
                        <Checkbox defaultChecked />
                        <span className="text-sm">Visualizar</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <Checkbox />
                        <span className="text-sm">Editar</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <Checkbox />
                        <span className="text-sm">Deletar</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <Checkbox />
                        <span className="text-sm">Exportar</span>
                      </label>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setShowPermissionDialog(false)}>
                    Cancelar
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Salvar Permissões
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Nenhum dashboard disponível</div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de Edição de Usuário */}
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
            </DialogHeader>

            {editingUser && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={editingUser.email || ''}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, email: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Nome</label>
                  <Input
                    value={editingUser.name || ''}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, name: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Papel</label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(value) =>
                      setEditingUser({ ...editingUser, role: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="viewer">Visualizador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setEditingUser(null)}>
                    Cancelar
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() =>
                      handleUpdateUser(editingUser.id, {
                        name: editingUser.name,
                        email: editingUser.email,
                        role: editingUser.role,
                      })
                    }
                  >
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
