import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageCircle, Users, Sparkles } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: reviews } = trpc.public.getPublishedReviews.useQuery();
  const { data: voyants } = trpc.public.getAllVoyants.useQuery();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "agent") {
        navigate("/agent/dashboard");
      } else if (user.role === "client") {
        navigate("/client/dashboard");
      }
    }
  }, [isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-md border-b border-purple-500/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="h-8 w-8" />}
            <h1 className="text-2xl font-bold text-white">{APP_TITLE}</h1>
          </div>
          <nav className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <a href={getLoginUrl()} className="text-white hover:text-purple-300 transition">
                  Se connecter
                </a>
                <Button
                  onClick={() => (window.location.href = getLoginUrl())}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Commencer
                </Button>
              </>
            ) : null}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">
            Découvrez votre avenir avec nos voyants
          </h2>
          <p className="text-xl text-purple-200 mb-8">
            Consultations en direct avec les meilleurs voyants de France
          </p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg px-8"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Consulter maintenant
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <Card className="bg-black/40 border-purple-500/20 backdrop-blur">
            <CardHeader>
              <MessageCircle className="h-8 w-8 text-purple-400 mb-2" />
              <CardTitle className="text-white">Tchat en Direct</CardTitle>
            </CardHeader>
            <CardContent className="text-purple-200">
              Communiquez en temps réel avec nos voyants expérimentés
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/20 backdrop-blur">
            <CardHeader>
              <Users className="h-8 w-8 text-purple-400 mb-2" />
              <CardTitle className="text-white">Voyants Certifiés</CardTitle>
            </CardHeader>
            <CardContent className="text-purple-200">
              Tous nos voyants sont vérifiés et expérimentés
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-purple-500/20 backdrop-blur">
            <CardHeader>
              <Star className="h-8 w-8 text-purple-400 mb-2" />
              <CardTitle className="text-white">Satisfait Garanti</CardTitle>
            </CardHeader>
            <CardContent className="text-purple-200">
              Consultations de qualité ou remboursé
            </CardContent>
          </Card>
        </div>

        {/* Voyants Section */}
        {voyants && voyants.length > 0 && (
          <section className="mb-20">
            <h3 className="text-3xl font-bold text-white mb-8">Nos Voyants</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {voyants.slice(0, 6).map((voyant) => (
                <Card
                  key={voyant.id}
                  className="bg-black/40 border-purple-500/20 backdrop-blur overflow-hidden hover:border-purple-400/50 transition"
                >
                  {voyant.imageUrl && (
                    <img
                      src={voyant.imageUrl}
                      alt={voyant.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="text-white">{voyant.name}</CardTitle>
                    <CardDescription className="text-purple-300">
                      {voyant.specialty}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-purple-200 text-sm mb-4">{voyant.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white font-semibold">{voyant.rating}</span>
                      </div>
                      <span className="text-purple-300">
                        {voyant.pricePerMinute}€/min
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        {reviews && reviews.length > 0 && (
          <section>
            <h3 className="text-3xl font-bold text-white mb-8">Avis de nos Clients</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.slice(0, 4).map((review) => (
                <Card
                  key={review.id}
                  className="bg-black/40 border-purple-500/20 backdrop-blur"
                >
                  <CardHeader>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-purple-200 italic mb-4">"{review.comment}"</p>
                    <p className="text-purple-400 text-sm">
                      {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-black/60 border-t border-purple-500/20 py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-purple-300">
          <p>&copy; 2024 {APP_TITLE}. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
