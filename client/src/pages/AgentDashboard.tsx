import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, TrendingUp, Clock, Send } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Conversation {
  id: number;
  clientId: number;
  voyantId: number;
  status: string;
  minutesUsed: number;
  totalCost: string;
  startedAt: Date;
  endedAt?: Date;
}

export default function AgentDashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");

  const { data: voyants } = trpc.agent.getMyVoyants.useQuery();
  const { data: conversations } = trpc.agent.getMyConversations.useQuery();
  const { data: messages } = trpc.agent.getConversationMessages.useQuery(
    { conversationId: selectedConversationId || 0 },
    { enabled: !!selectedConversationId }
  );
  const sendMessageMutation = trpc.agent.sendMessage.useMutation();

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

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversationId) {
      toast.error("Veuillez entrer un message");
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversationId,
        content: messageText,
      });
      setMessageText("");
      toast.success("Message envoyé");
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message");
    }
  };

  // Group conversations by voyant
  const conversationsByVoyant = (voyants || []).reduce((acc: any[], voyant: any) => {
    const voyantConversations = (conversations || []).filter(
      (conv: any) => conv.voyantId === voyant.id
    );
    if (voyantConversations.length > 0) {
      acc.push({ voyant, conversations: voyantConversations });
    }
    return acc;
  }, []);

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <div className="lg:col-span-1 flex flex-col">
          <h2 className="text-xl font-bold mb-4">Mes Conversations</h2>
          <div className="space-y-2 overflow-y-auto flex-1">
            {conversationsByVoyant.length > 0 ? (
              conversationsByVoyant.map(({ voyant, conversations: convs }: any) => (
                <div key={voyant.id}>
                  <h3 className="text-sm font-semibold text-purple-600 px-3 py-2 bg-purple-50 rounded">
                    {voyant.name}
                  </h3>
                  <div className="space-y-1">
                    {convs.map((conv: any) => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversationId(conv.id)}
                        className={`w-full text-left px-3 py-2 rounded transition ${
                          selectedConversationId === conv.id
                            ? "bg-purple-500 text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              Client #{conv.clientId}
                            </p>
                            <p className="text-xs opacity-75">
                              {conv.minutesUsed} min
                            </p>
                          </div>
                          {conv.status === "active" && (
                            <Badge className="bg-green-500 text-white text-xs">
                              Actif
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucune conversation</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col border rounded-lg bg-white">
          {selectedConversationId ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages && messages.length > 0 ? (
                  messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.senderType === "agent" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.senderType === "agent"
                            ? "bg-purple-500 text-white"
                            : "bg-gray-200 text-gray-900"
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
                  <div className="text-center py-8 text-gray-500">
                    <p>Aucun message pour le moment</p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t p-4 flex gap-2">
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
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Sélectionnez une conversation pour commencer</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
