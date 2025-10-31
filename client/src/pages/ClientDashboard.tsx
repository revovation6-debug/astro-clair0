import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Clock, MessageCircle, Zap, Send, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ClientDashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedVoyantId, setSelectedVoyantId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [conversationTime, setConversationTime] = useState(0);
  const [isConversationActive, setIsConversationActive] = useState(false);

  const { data: voyants } = trpc.public.getAllVoyants.useQuery();
  const { data: activeConversation } = trpc.clientData.getActiveConversation.useQuery();
  const { data: messages } = trpc.agent.getConversationMessages.useQuery(
    { conversationId: (activeConversation as any)?.id || 0 },
    { enabled: !!activeConversation }
  );
  const { data: minutePacks } = trpc.clientData.getMyMinutes.useQuery();

  const sendMessageMutation = trpc.agent.sendMessage.useMutation();
  const endConversationMutation = trpc.clientData.endConversation.useMutation();

  useEffect(() => {
    if (!loading && user?.role !== "client") {
      navigate("/");
    }
  }, [loading, user, navigate]);

  // Timer for conversation
  useEffect(() => {
    if (!isConversationActive) return;

    const interval = setInterval(() => {
      setConversationTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isConversationActive]);

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

  const handleStartConversation = (voyantId: number) => {
    setSelectedVoyantId(voyantId);
    setIsConversationActive(true);
    setConversationTime(0);
    toast.success("Conversation démarrée");
  };

  const handleEndConversation = async () => {
    if (activeConversation) {
      try {
        await endConversationMutation.mutateAsync({
          conversationId: (activeConversation as any).id,
        });
        setIsConversationActive(false);
        setSelectedVoyantId(null);
        setConversationTime(0);
        toast.success("Conversation terminée");
      } catch (error) {
        toast.error("Erreur lors de la fermeture de la conversation");
      }
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeConversation) {
      toast.error("Veuillez entrer un message");
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: (activeConversation as any).id,
        content: messageText,
      });
      setMessageText("");
      toast.success("Message envoyé");
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message");
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const totalMinutesAvailable = (minutePacks || []).reduce(
    (sum: number, pack: any) => sum + pack.minutes,
    0
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Mon Espace Client</h1>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="font-bold text-lg">{totalMinutesAvailable} minutes</span>
          </div>
        </div>

        {/* Minutes Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Minutes Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMinutesAvailable}</div>
              <p className="text-xs text-gray-500 mt-1">Minutes restantes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Temps Utilisé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(conversationTime)}</div>
              <p className="text-xs text-gray-500 mt-1">Conversation actuelle</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Statut
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className={
                  isConversationActive
                    ? "bg-green-500 text-white"
                    : "bg-gray-500 text-white"
                }
              >
                {isConversationActive ? "En conversation" : "Disponible"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Packs Available */}
        <Card>
          <CardHeader>
            <CardTitle>Mes Packs de Minutes</CardTitle>
          </CardHeader>
          <CardContent>
            {minutePacks && minutePacks.length > 0 ? (
              <div className="space-y-2">
                {minutePacks.map((pack: any) => (
                  <div
                    key={pack.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{pack.minutes} minutes</p>
                      <p className="text-sm text-gray-600">
                        Expire le {new Date(pack.expiresAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <Badge className="bg-purple-600">{pack.minutes} min</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Zap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucun pack de minutes</p>
                <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                  Acheter des minutes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Conversation */}
        {isConversationActive && activeConversation ? (
          <Card className="border-2 border-green-500">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Conversation Active</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Durée: {formatTime(conversationTime)}
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleEndConversation}
                disabled={endConversationMutation.isPending}
              >
                <X className="mr-2 h-4 w-4" />
                Terminer
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Messages */}
                <div className="border rounded-lg p-4 h-64 overflow-y-auto space-y-4 bg-gray-50">
                  {messages && messages.length > 0 ? (
                    messages.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.senderType === "client" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.senderType === "client"
                              ? "bg-purple-500 text-white"
                              : "bg-white text-gray-900 border"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs opacity-75 mt-1">
                            {new Date(msg.createdAt).toLocaleTimeString("fr-FR")}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500">
                      <p>Aucun message pour le moment</p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Tapez votre message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sendMessageMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Voyants Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              {voyants && voyants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {voyants.map((voyant: any) => (
                    <div
                      key={voyant.id}
                      className="border rounded-lg p-4 hover:shadow-lg transition"
                    >
                      <h3 className="font-bold text-lg mb-2">{voyant.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{voyant.specialty}</p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-purple-600 font-bold">
                          {voyant.pricePerMinute}€/min
                        </span>
                        <Badge className="bg-green-500">En ligne</Badge>
                      </div>
                      <Button
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        onClick={() => handleStartConversation(voyant.id)}
                        disabled={totalMinutesAvailable === 0}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Consulter
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun voyant disponible pour le moment</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
