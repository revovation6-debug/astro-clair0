import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageCircle, Users, Sparkles, Clock, Eye, EyeOff, Zap } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function ClientHome() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: reviews } = trpc.public.getPublishedReviews.useQuery();
  const { data: voyants } = trpc.public.getAllVoyants.useQuery();
  const { data: agents } = trpc.public.getOnlineAgents.useQuery();

  useEffect(() => {
    if (isAuthenticated && user?.role === "client") {
      navigate("/client/dashboard");
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="h-8 w-8" />}
              <h1 className="text-2xl font-bold text-purple-600">{APP_TITLE}</h1>
            </div>
            <nav className="flex items-center gap-4">
              {!isAuthenticated ? (
                <>
                  <a
                    href={getLoginUrl()}
                    className="text-gray-700 hover:text-purple-600 font-medium"
                  >
                    Se connecter
                  </a>
                  <Button
                    onClick={() => (window.location.href = getLoginUrl())}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    S'inscrire
                  </Button>
                </>
              ) : null}
            </nav>
          </div>

          {/* Navigation Menu */}
          <nav className="flex gap-8 text-sm font-medium">
            <a href="#experts" className="text-gray-700 hover:text-purple-600">
              Tous les experts
            </a>
            <a href="#avis" className="text-gray-700 hover:text-purple-600">
              Les avis
            </a>
            <a href="#horoscope" className="text-gray-700 hover:text-purple-600">
              Horoscope
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Découvrez votre avenir avec nos voyants
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Consultations en direct avec les meilleurs voyants de France
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Consulter maintenant
            </Button>
          </div>
        </div>
      </section>

      {/* Tous les experts Section */}
      <section id="experts" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12">Tous les experts</h2>
          {voyants && voyants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {voyants.map((voyant: any) => {
                const isOnline = agents?.some((a: any) => a.id === voyant.agentId && a.isOnline);
                return (
                  <Card
                    key={voyant.id}
                    className="hover:shadow-lg transition overflow-hidden"
                  >
                    {voyant.imageUrl && (
                      <img
                        src={voyant.imageUrl}
                        alt={voyant.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{voyant.name}</CardTitle>
                          <p className="text-sm text-gray-600">{voyant.specialty}</p>
                        </div>
                        {isOnline && (
                          <Badge className="bg-green-500 text-white">En ligne</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="font-semibold">{voyant.rating}</span>
                        </div>
                        <span className="text-purple-600 font-bold">
                          {voyant.pricePerMinute}€/min
                        </span>
                      </div>
                      <Button
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        onClick={() => (window.location.href = getLoginUrl())}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Consulter
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucun voyant disponible pour le moment</p>
            </div>
          )}
        </div>
      </section>

      {/* Avis Section */}
      <section id="avis" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12">Les avis de nos clients</h2>
          {reviews && reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.slice(0, 6).map((review: any) => (
                <Card key={review.id} className="hover:shadow-lg transition">
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
                    <p className="text-gray-700 mb-4 italic">"{review.comment}"</p>
                    <p className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucun avis pour le moment</p>
            </div>
          )}
        </div>
      </section>

      {/* Horoscope Section */}
      <section id="horoscope" className="py-16 bg-gradient-to-r from-purple-100 to-pink-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12">Horoscope du jour</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { sign: "Bélier", symbol: "♈", date: "21 mars - 19 avril" },
              { sign: "Taureau", symbol: "♉", date: "20 avril - 20 mai" },
              { sign: "Gémeaux", symbol: "♊", date: "21 mai - 20 juin" },
              { sign: "Cancer", symbol: "♋", date: "21 juin - 22 juillet" },
              { sign: "Lion", symbol: "♌", date: "23 juillet - 22 août" },
              { sign: "Vierge", symbol: "♍", date: "23 août - 22 septembre" },
              { sign: "Balance", symbol: "♎", date: "23 septembre - 22 octobre" },
              { sign: "Scorpion", symbol: "♏", date: "23 octobre - 21 novembre" },
              { sign: "Sagittaire", symbol: "♐", date: "22 novembre - 21 décembre" },
              { sign: "Capricorne", symbol: "♑", date: "22 décembre - 19 janvier" },
              { sign: "Verseau", symbol: "♒", date: "20 janvier - 18 février" },
              { sign: "Poissons", symbol: "♓", date: "19 février - 20 mars" },
            ].map((sign) => (
              <Card key={sign.sign} className="text-center hover:shadow-lg transition">
                <CardHeader>
                  <div className="text-4xl mb-2">{sign.symbol}</div>
                  <CardTitle>{sign.sign}</CardTitle>
                  <p className="text-sm text-gray-600">{sign.date}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-4">
                    Les astres vous réservent de belles surprises aujourd'hui. Une journée
                    propice aux nouvelles rencontres et aux décisions importantes.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => (window.location.href = getLoginUrl())}
                  >
                    En savoir plus
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Packs Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Nos packs de minutes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { minutes: 5, price: 15, popular: false },
              { minutes: 15, price: 45, popular: true },
              { minutes: 30, price: 90, popular: false },
            ].map((pack) => (
              <Card
                key={pack.minutes}
                className={`relative hover:shadow-lg transition ${
                  pack.popular ? "ring-2 ring-purple-600" : ""
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600">Populaire</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{pack.minutes} minutes</CardTitle>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{pack.price}€</p>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    {(pack.price / pack.minutes).toFixed(2)}€ par minute
                  </p>
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => (window.location.href = getLoginUrl())}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Acheter maintenant
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à découvrir votre avenir ?</h2>
          <p className="text-lg mb-8 opacity-90">
            Rejoignez des milliers de clients satisfaits et consultez nos meilleurs voyants
          </p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Commencer une consultation
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">À propos</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Qui sommes-nous
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Nos voyants
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Avis clients
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Légal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Conditions d'utilisation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Politique de confidentialité
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Mentions légales
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Aide et FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Nous contacter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Signaler un problème
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Suivez-nous</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Twitter
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>&copy; 2024 {APP_TITLE}. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
