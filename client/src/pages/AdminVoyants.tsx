import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Edit2, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminVoyants() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    agentId: "",
    name: "",
    specialty: "",
    description: "",
    imageUrl: "",
    pricePerMinute: "",
  });

  const { data: voyants, refetch: refetchVoyants } = trpc.admin.getAllVoyants.useQuery();
  const { data: agents } = trpc.admin.getAllAgents.useQuery();
  const createVoyantMutation = trpc.admin.createVoyant.useMutation();
  const deleteVoyantMutation = trpc.admin.deleteVoyant.useMutation();

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

  const handleCreateVoyant = async () => {
    if (!formData.agentId || !formData.name || !formData.pricePerMinute) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    try {
      await createVoyantMutation.mutateAsync({
        agentId: parseInt(formData.agentId),
        name: formData.name,
        specialty: formData.specialty,
        description: formData.description,
        imageUrl: formData.imageUrl,
        pricePerMinute: formData.pricePerMinute,
      });
      toast.success("Voyant créé avec succès");
      setFormData({
        agentId: "",
        name: "",
        specialty: "",
        description: "",
        imageUrl: "",
        pricePerMinute: "",
      });
      refetchVoyants();
    } catch (error) {
      toast.error("Erreur lors de la création du voyant");
    }
  };

  const handleDeleteVoyant = async (voyantId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce voyant ?")) {
      try {
        await deleteVoyantMutation.mutateAsync({ id: voyantId });
        toast.success("Voyant supprimé avec succès");
        refetchVoyants();
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestion des Voyants</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Créer un Voyant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un nouveau voyant</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Agent *</label>
                  <Select value={formData.agentId} onValueChange={(value) =>
                    setFormData({ ...formData, agentId: value })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents?.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id.toString()}>
                          {agent.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Nom du voyant *</label>
                  <Input
                    placeholder="Ex: Madame Mystère"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Spécialité</label>
                  <Input
                    placeholder="Ex: Tarot, Astrologie"
                    value={formData.specialty}
                    onChange={(e) =>
                      setFormData({ ...formData, specialty: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Décrivez les services du voyant..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">URL de l'image</label>
                  <Input
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Prix par minute (€) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 2.50"
                    value={formData.pricePerMinute}
                    onChange={(e) =>
                      setFormData({ ...formData, pricePerMinute: e.target.value })
                    }
                  />
                </div>
                <Button
                  onClick={handleCreateVoyant}
                  disabled={createVoyantMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {createVoyantMutation.isPending ? "Création..." : "Créer le voyant"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des Voyants</CardTitle>
          </CardHeader>
          <CardContent>
            {voyants && voyants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {voyants.map((voyant) => (
                  <div
                    key={voyant.id}
                    className="border rounded-lg overflow-hidden hover:shadow-lg transition"
                  >
                    {voyant.imageUrl && (
                      <img
                        src={voyant.imageUrl}
                        alt={voyant.name}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1">{voyant.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{voyant.specialty}</p>
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                        {voyant.description}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-semibold">{voyant.rating}</span>
                        </div>
                        <span className="text-sm font-semibold text-purple-600">
                          {voyant.pricePerMinute}€/min
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          disabled
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteVoyant(voyant.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Aucun voyant créé pour le moment</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
