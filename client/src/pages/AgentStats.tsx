import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Calendar, DollarSign, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AgentStats() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: stats } = trpc.agent.getMyStats.useQuery({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

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

  const totalEarnings = (stats || []).reduce(
    (sum, stat: any) => sum + parseFloat(stat.earnings || 0),
    0
  );
  const totalMinutes = (stats || []).reduce(
    (sum, stat: any) => sum + (stat.minutesServed || 0),
    0
  );
  const totalClients = (stats || []).reduce(
    (sum, stat: any) => sum + (stat.clientsServed || 0),
    0
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Mes Statistiques</h1>
        </div>

        {/* Date Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Filtre par Période
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div>
                <label className="text-sm font-medium">Date de début</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date de fin</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Appliquer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Revenus Totaux
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEarnings.toFixed(2)}€</div>
              <p className="text-xs text-gray-500 mt-1">Période sélectionnée</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Minutes Servies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMinutes}</div>
              <p className="text-xs text-gray-500 mt-1">Total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Clients Servis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClients}</div>
              <p className="text-xs text-gray-500 mt-1">Uniques</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Revenu Moyen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalClients > 0 ? (totalEarnings / totalClients).toFixed(2) : 0}€
              </div>
              <p className="text-xs text-gray-500 mt-1">Par client</p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Stats Table */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiques Quotidiennes</CardTitle>
          </CardHeader>
          <CardContent>
            {stats && stats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 font-semibold">Date</th>
                      <th className="text-left py-2 px-4 font-semibold">Minutes</th>
                      <th className="text-left py-2 px-4 font-semibold">Clients</th>
                      <th className="text-left py-2 px-4 font-semibold">Conversations</th>
                      <th className="text-left py-2 px-4 font-semibold">Revenus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((stat: any) => (
                      <tr key={stat.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">
                          {new Date(stat.date).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="py-2 px-4">{stat.minutesServed}</td>
                        <td className="py-2 px-4">{stat.clientsServed}</td>
                        <td className="py-2 px-4">{stat.conversationCount}</td>
                        <td className="py-2 px-4 font-semibold">
                          {parseFloat(stat.earnings || 0).toFixed(2)}€
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Aucune statistique pour cette période</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
