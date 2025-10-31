import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, MessageSquare, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const { data: stats } = trpc.admin.getDashboardStats.useQuery();

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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Clients Inscrits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Clients actifs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Agents en Ligne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.onlineAgents || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Sur {stats?.totalAgents || 0} agents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-500 mt-1">Actives maintenant</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Revenus Totaux</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0€</div>
              <p className="text-xs text-gray-500 mt-1">Ce mois</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestion des Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Gérez les comptes clients, attribuez des packs de minutes
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/clients")}
              >
                Accéder
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Gestion des Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Créez, gérez et supprimez les comptes des agents
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/agents")}
              >
                Accéder
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Gestion des Avis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Créez et validez les avis pour la page d'accueil
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/reviews")}
              >
                Accéder
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiques par Période</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Les graphiques de statistiques seront affichés ici</p>
              <p className="text-sm mt-2">Sélectionnez une période pour voir les données</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
