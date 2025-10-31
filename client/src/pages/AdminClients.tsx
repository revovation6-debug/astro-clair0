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
import { Gift, Trash2, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminClients() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [minutesForm, setMinutesForm] = useState({
    minutes: "",
    reason: "",
  });

  const { data: clients, refetch } = trpc.admin.getAllClients.useQuery();
  const deleteClientMutation = trpc.admin.deleteClient.useMutation();
  const grantMinutesMutation = trpc.admin.grantMinutePack.useMutation();

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

  const handleDeleteClient = async (clientId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      try {
        await deleteClientMutation.mutateAsync({ id: clientId });
        toast.success("Client supprimé avec succès");
        refetch();
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleGrantMinutes = async () => {
    if (!minutesForm.minutes || !selectedClientId) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      await grantMinutesMutation.mutateAsync({
        clientId: selectedClientId,
        minutes: parseInt(minutesForm.minutes),
        reason: minutesForm.reason,
      });
      toast.success("Minutes attribuées avec succès");
      setMinutesForm({ minutes: "", reason: "" });
      setSelectedClientId(null);
      refetch();
    } catch (error) {
      toast.error("Erreur lors de l'attribution des minutes");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestion des Clients</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des Clients Inscrits</CardTitle>
          </CardHeader>
          <CardContent>
            {clients && clients.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom d'utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Minutes Disponibles</TableHead>
                      <TableHead>Minutes Utilisées</TableHead>
                      <TableHead>Total Dépensé</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.username}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            {client.totalMinutesAvailable}
                          </div>
                        </TableCell>
                        <TableCell>{client.totalMinutesUsed}</TableCell>
                        <TableCell>{client.totalSpent}€</TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              client.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {client.isActive ? "Actif" : "Inactif"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedClientId(client.id)}
                                >
                                  <Gift className="h-4 w-4 mr-1" />
                                  Attribuer Minutes
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    Attribuer des minutes gratuites
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">
                                      Nombre de minutes
                                    </label>
                                    <Input
                                      type="number"
                                      placeholder="Ex: 30"
                                      value={minutesForm.minutes}
                                      onChange={(e) =>
                                        setMinutesForm({
                                          ...minutesForm,
                                          minutes: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Raison (optionnel)
                                    </label>
                                    <Input
                                      placeholder="Ex: Client fidèle"
                                      value={minutesForm.reason}
                                      onChange={(e) =>
                                        setMinutesForm({
                                          ...minutesForm,
                                          reason: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <Button
                                    onClick={handleGrantMinutes}
                                    disabled={grantMinutesMutation.isPending}
                                    className="w-full bg-purple-600 hover:bg-purple-700"
                                  >
                                    {grantMinutesMutation.isPending
                                      ? "Attribution..."
                                      : "Attribuer les minutes"}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClient(client.id)}
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
                <p>Aucun client inscrit pour le moment</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
