import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Briefcase, DollarSign, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AgentProfile() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  const { data: voyants } = trpc.agent.getMyVoyants.useQuery();

  useEffect(() => {
    if (!loading && user?.role !== "agent") {
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

  if (user?.role !== "agent") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mon Profil</h1>
          <p className="text-gray-600 mt-2">Gérez vos informations et vos voyants assignés</p>
        </div>

        {/* Agent Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Nom</label>
                <p className="text-lg font-semibold mt-1">{user?.name || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-lg font-semibold mt-1">{user?.email || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Rôle</label>
                <p className="text-lg font-semibold mt-1 capitalize">Agent de Voyance</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Membre depuis</label>
                <p className="text-lg font-semibold mt-1">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Voyants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Mes Voyants Assignés
            </CardTitle>
          </CardHeader>
          <CardContent>
            {voyants && voyants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {voyants.map((voyant: any) => (
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
                      <p className="text-sm text-gray-600 mb-3">{voyant.specialty}</p>
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {voyant.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-semibold">{voyant.rating}</span>
                          <span className="text-xs text-gray-500">
                            ({voyant.totalReviews})
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-purple-600">
                          {voyant.pricePerMinute}€/min
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucun voyant assigné pour le moment</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Voyants Actifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {voyants?.filter((v: any) => v.isActive).length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Note Moyenne
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {voyants && voyants.length > 0
                  ? (
                      voyants.reduce((sum: number, v: any) => sum + parseFloat(v.rating || 0), 0) /
                      voyants.length
                    ).toFixed(2)
                  : "0.00"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Avis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {voyants?.reduce((sum: number, v: any) => sum + (v.totalReviews || 0), 0) || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
