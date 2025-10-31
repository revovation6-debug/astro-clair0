import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle, Zap, CreditCard, Clock } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function ClientProfile() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [copied, setCopied] = useState(false);

  const { data: profile } = trpc.clientData.getMyProfile.useQuery();
  const { data: minutePacks } = trpc.clientData.getMyMinutes.useQuery();

  useEffect(() => {
    if (!loading && user?.role !== "client") {
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

  if (user?.role !== "client") {
    return null;
  }

  // Generate random 7-digit ID if not exists
  const clientId = (profile as any)?.clientId || Math.floor(1000000 + Math.random() * 9000000);

  const handleCopyId = () => {
    navigator.clipboard.writeText(clientId.toString());
    setCopied(true);
    toast.success("ID copié dans le presse-papiers");
    setTimeout(() => setCopied(false), 2000);
  };

  const freeMinutes = (minutePacks || []).reduce(
    (sum: number, pack: any) => (pack.isFree ? sum + pack.minutes : sum),
    0
  );
  const paidMinutes = (minutePacks || []).reduce(
    (sum: number, pack: any) => (!pack.isFree ? sum + pack.minutes : sum),
    0
  );
  const totalMinutes = freeMinutes + paidMinutes;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mon Profil</h1>
          <p className="text-gray-600 mt-2">Gérez vos informations personnelles et votre compte</p>
        </div>

        {/* Client ID Card */}
        <Card className="border-2 border-purple-600 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              Votre ID Client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">Identifiant unique (7 chiffres)</p>
                <div className="text-4xl font-bold text-purple-600 font-mono tracking-widest">
                  {clientId}
                </div>
              </div>
              <Button
                onClick={handleCopyId}
                className={`${
                  copied
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                <Copy className="mr-2 h-4 w-4" />
                {copied ? "Copié !" : "Copier"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Nom d'utilisateur</label>
                <p className="text-lg font-semibold mt-1">{user?.name || "N/A"}</p>
                <p className="text-xs text-gray-500 mt-1">Non modifiable après inscription</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-lg font-semibold mt-1">{user?.email || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Statut</label>
                <p className="text-lg font-semibold mt-1">
                  <Badge className="bg-green-600">Actif</Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Membre depuis</label>
                <p className="text-lg font-semibold mt-1">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("fr-FR")
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Minutes Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Total Minutes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMinutes}</div>
              <p className="text-xs text-gray-500 mt-1">Minutes disponibles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500"></span>
                Minutes Gratuites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{freeMinutes}</div>
              <p className="text-xs text-gray-500 mt-1">Offertes/Gratuites</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-green-500"></span>
                Minutes Payantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{paidMinutes}</div>
              <p className="text-xs text-gray-500 mt-1">Achetées</p>
            </CardContent>
          </Card>
        </div>

        {/* Minutes Packs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Mes Packs de Minutes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {minutePacks && minutePacks.length > 0 ? (
              <div className="space-y-3">
                {minutePacks.map((pack: any) => (
                  <div
                    key={pack.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      pack.isFree ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-full ${
                          pack.isFree ? "bg-red-500" : "bg-green-500"
                        }`}></span>
                        <p className="font-semibold">{pack.minutes} minutes</p>
                        <Badge className={pack.isFree ? "bg-red-600" : "bg-green-600"}>
                          {pack.isFree ? "Gratuit" : "Payant"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Expire le {new Date(pack.expiresAt).toLocaleDateString("fr-FR")}
                      </p>
                      {pack.reason && (
                        <p className="text-xs text-gray-500 mt-1">Raison: {pack.reason}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-600">
                        {pack.minutesUsed}/{pack.minutes}
                      </p>
                      <p className="text-xs text-gray-500">Utilisées</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucun pack de minutes</p>
                <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Acheter des minutes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle>Sécurité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Mot de passe</label>
                <p className="text-gray-700 mt-1">••••••••</p>
                <Button variant="outline" className="mt-2">
                  Modifier le mot de passe
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Actions du Compte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full">
                Télécharger mes données
              </Button>
              <Button variant="destructive" className="w-full">
                Supprimer mon compte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
