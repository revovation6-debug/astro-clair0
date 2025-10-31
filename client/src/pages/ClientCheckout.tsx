import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Check, Zap, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const MINUTE_PACKS = [
  { id: "5", minutes: 5, price: 15, pricePerMinute: 3.0 },
  { id: "15", minutes: 15, price: 45, pricePerMinute: 3.0, popular: true },
  { id: "30", minutes: 30, price: 90, pricePerMinute: 3.0 },
];

export default function ClientCheckout() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const purchaseMinutePackMutation = trpc.clientData.purchaseMinutePack.useMutation();

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

  const handlePurchase = async (packId: string) => {
    setSelectedPack(packId);
    setIsProcessing(true);

    try {
      const result = await purchaseMinutePackMutation.mutateAsync({
        packType: packId as "5" | "15" | "30",
      });

      if (result.success) {
        toast.success("Paiement traité avec succès !");
        setTimeout(() => {
          navigate("/client/dashboard");
        }, 2000);
      }
    } catch (error) {
      toast.error("Erreur lors du paiement. Veuillez réessayer.");
    } finally {
      setIsProcessing(false);
      setSelectedPack(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/client/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Acheter des Minutes</h1>
            <p className="text-gray-600 mt-1">Sélectionnez un pack et complétez votre achat</p>
          </div>
        </div>

        {/* Packs Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MINUTE_PACKS.map((pack) => (
            <Card
              key={pack.id}
              className={`relative cursor-pointer transition transform hover:scale-105 ${
                selectedPack === pack.id
                  ? "ring-2 ring-purple-600 shadow-lg"
                  : "hover:shadow-lg"
              } ${pack.popular ? "md:scale-105" : ""}`}
              onClick={() => setSelectedPack(pack.id)}
            >
              {pack.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white">Populaire</Badge>
                </div>
              )}

              <CardHeader className="text-center pt-8">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="h-8 w-8 text-yellow-500" />
                </div>
                <CardTitle className="text-2xl">{pack.minutes} minutes</CardTitle>
                <div className="text-3xl font-bold text-purple-600 mt-2">{pack.price}€</div>
                <p className="text-sm text-gray-600 mt-1">
                  {pack.pricePerMinute.toFixed(2)}€ par minute
                </p>
              </CardHeader>

              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Accès illimité aux voyants</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Valable 30 jours</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Pas d'engagement</span>
                  </div>
                </div>

                <Button
                  className={`w-full ${
                    selectedPack === pack.id
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
                  onClick={() => setSelectedPack(pack.id)}
                >
                  {selectedPack === pack.id ? "Sélectionné" : "Sélectionner"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Summary */}
        {selectedPack && (
          <Card className="border-2 border-purple-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Résumé de la Commande
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <span>Pack de minutes:</span>
                  <span className="font-semibold">
                    {MINUTE_PACKS.find((p) => p.id === selectedPack)?.minutes} minutes
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span>Prix unitaire:</span>
                  <span className="font-semibold">
                    {MINUTE_PACKS.find((p) => p.id === selectedPack)?.pricePerMinute.toFixed(2)}€/min
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-purple-600">
                    {MINUTE_PACKS.find((p) => p.id === selectedPack)?.price}€
                  </span>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <p className="text-sm text-blue-900">
                    💳 Le paiement sera traité de manière sécurisée via Stripe. Vos données
                    bancaires ne sont jamais stockées sur nos serveurs.
                  </p>
                </div>

                <Button
                  onClick={() => handlePurchase(selectedPack)}
                  disabled={isProcessing}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Procéder au paiement
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setSelectedPack(null)}
                  className="w-full"
                  disabled={isProcessing}
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Questions Fréquentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Comment fonctionne le décompte ?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Les minutes sont décomptées en temps réel pendant votre conversation avec un
                  voyant. Le minuteur s'affiche pendant l'appel.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Puis-je utiliser plusieurs packs ?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Oui, vous pouvez acheter plusieurs packs. Les minutes s'accumulent dans votre
                  compte et expirent après 30 jours.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Puis-je me faire rembourser ?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Les minutes non utilisées peuvent être remboursées dans les 7 jours suivant
                  l'achat. Contactez notre support pour plus d'informations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
