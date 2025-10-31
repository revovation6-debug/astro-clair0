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
import { Plus, Trash2, CheckCircle, XCircle, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminReviews() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    voyantId: "",
    rating: "5",
    comment: "",
  });

  const { data: reviews, refetch: refetchReviews } = trpc.admin.getAllReviews.useQuery();
  const { data: pendingReviews, refetch: refetchPending } =
    trpc.admin.getPendingReviews.useQuery();
  const { data: voyants } = trpc.admin.getAllVoyants.useQuery();
  const createReviewMutation = trpc.admin.createReview.useMutation();
  const approveReviewMutation = trpc.admin.approveReview.useMutation();
  const rejectReviewMutation = trpc.admin.rejectReview.useMutation();

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

  const handleCreateReview = async () => {
    if (!formData.comment) {
      toast.error("Veuillez entrer un commentaire");
      return;
    }

    try {
      await createReviewMutation.mutateAsync({
        voyantId: formData.voyantId ? parseInt(formData.voyantId) : undefined,
        rating: parseInt(formData.rating),
        comment: formData.comment,
      });
      toast.success("Avis créé et publié avec succès");
      setFormData({ voyantId: "", rating: "5", comment: "" });
      refetchReviews();
    } catch (error) {
      toast.error("Erreur lors de la création de l'avis");
    }
  };

  const handleApproveReview = async (reviewId: number) => {
    try {
      await approveReviewMutation.mutateAsync({ id: reviewId });
      toast.success("Avis approuvé et publié");
      refetchPending();
      refetchReviews();
    } catch (error) {
      toast.error("Erreur lors de l'approbation");
    }
  };

  const handleRejectReview = async (reviewId: number) => {
    if (confirm("Êtes-vous sûr de vouloir rejeter cet avis ?")) {
      try {
        await rejectReviewMutation.mutateAsync({ id: reviewId });
        toast.success("Avis rejeté");
        refetchPending();
      } catch (error) {
        toast.error("Erreur lors du rejet");
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestion des Avis</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Créer un Avis
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Créer un nouvel avis</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Voyant (optionnel)</label>
                  <Select value={formData.voyantId} onValueChange={(value) =>
                    setFormData({ ...formData, voyantId: value })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un voyant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucun voyant spécifique</SelectItem>
                      {voyants?.map((voyant) => (
                        <SelectItem key={voyant.id} value={voyant.id.toString()}>
                          {voyant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Note (1-5)</label>
                  <Select value={formData.rating} onValueChange={(value) =>
                    setFormData({ ...formData, rating: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 ⭐</SelectItem>
                      <SelectItem value="2">2 ⭐⭐</SelectItem>
                      <SelectItem value="3">3 ⭐⭐⭐</SelectItem>
                      <SelectItem value="4">4 ⭐⭐⭐⭐</SelectItem>
                      <SelectItem value="5">5 ⭐⭐⭐⭐⭐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Commentaire</label>
                  <Textarea
                    placeholder="Entrez le commentaire de l'avis..."
                    value={formData.comment}
                    onChange={(e) =>
                      setFormData({ ...formData, comment: e.target.value })
                    }
                    rows={4}
                  />
                </div>
                <Button
                  onClick={handleCreateReview}
                  disabled={createReviewMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {createReviewMutation.isPending ? "Création..." : "Créer et publier"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Pending Reviews */}
        {pendingReviews && pendingReviews.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-900">
                Avis en Attente de Validation ({pendingReviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingReviews.map((review) => (
                  <div
                    key={review.id}
                    className="border rounded-lg p-4 bg-white flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 text-yellow-400 fill-yellow-400"
                          />
                        ))}
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleApproveReview(review.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleRejectReview(review.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Published Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Avis Publiés ({reviews?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border rounded-lg p-4 flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 text-yellow-400 fill-yellow-400"
                          />
                        ))}
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRejectReview(review.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Aucun avis publié pour le moment</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
