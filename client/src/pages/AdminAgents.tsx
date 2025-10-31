import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Edit2, Eye, EyeOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminAgents() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    passwordHash: "",
  });

  const { data: agents, refetch } = trpc.admin.getAllAgents.useQuery();
  const createAgentMutation = trpc.admin.createAgent.useMutation();
  const deleteAgentMutation = trpc.admin.deleteAgent.useMutation();
  const updateAgentMutation = trpc.admin.updateAgent.useMutation();

  useEffect(() => {
    if (!loading && user?.role !== "admin") {
      navigate("/");
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return null;
  }

  const handleCreateAgent = async () => {
    if (!formData.username || !formData.passwordHash) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      await createAgentMutation.mutateAsync({
        username: formData.username,
        passwordHash: formData.passwordHash,
        userId: user.id || 0,
      });
      toast.success("Agent créé avec succès");
      setFormData({ username: "", passwordHash: "" });
      refetch();
    } catch (error) {
      toast.error("Erreur lors de la création de l'agent");
    }
  };

  const handleDeleteAgent = async (agentId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet agent ?")) {
      try {
        await deleteAgentMutation.mutateAsync({ id: agentId });
        toast.success("Agent supprimé avec succès");
        refetch();
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleToggleOnline = async (agentId: number, isOnline: boolean) => {
    try {
      await updateAgentMutation.mutateAsync({
        id: agentId,
        updates: { isOnline: !isOnline },
      });
      refetch();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestion des Agents</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Créer un Agent
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouvel agent</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nom d'utilisateur</label>
                  <Input
                    placeholder="Ex: agent_voyance_01"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Mot de passe</label>
                  <div className="flex gap-2">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Entrez un mot de passe sécurisé"
                      value={formData.passwordHash}
                      onChange={(e) =>
                        setFormData({ ...formData, passwordHash: e.target.value })
                      }
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handleCreateAgent}
                  disabled={createAgentMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {createAgentMutation.isPending ? "Création..." : "Créer l'agent"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des Agents</CardTitle>
          </CardHeader>
          <CardContent>
            {agents && agents.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom d'utilisateur</TableHead>
                      <TableHead>Clients Servis</TableHead>
                      <TableHead>Minutes Servies</TableHead>
                      <TableHead>Revenus</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">{agent.username}</TableCell>
                        <TableCell>{agent.totalClients}</TableCell>
                        <TableCell>{agent.totalMinutesServed}</TableCell>
                        <TableCell>{agent.totalEarnings}€</TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              agent.isOnline
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {agent.isOnline ? "En ligne" : "Hors ligne"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleToggleOnline(agent.id, agent.isOnline)
                              }
                            >
                              {agent.isOnline ? "Déconnecter" : "Connecter"}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteAgent(agent.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Aucun agent créé pour le moment</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
