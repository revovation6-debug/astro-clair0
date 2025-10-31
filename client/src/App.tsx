import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import ClientHome from "@/pages/ClientHome";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminAgents from "@/pages/AdminAgents";
import AdminClients from "@/pages/AdminClients";
import AdminReviews from "@/pages/AdminReviews";
import AdminVoyants from "@/pages/AdminVoyants";
import AgentDashboard from "@/pages/AgentDashboard";
import AgentStats from "@/pages/AgentStats";
import AgentProfile from "@/pages/AgentProfile";
import ClientDashboard from "@/pages/ClientDashboard";
import ClientProfile from "@/pages/ClientProfile";
import ClientCheckout from "@/pages/ClientCheckout";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={ClientHome} />
      <Route path={"/admin/dashboard"} component={AdminDashboard} />
      <Route path={"/admin/agents"} component={AdminAgents} />
      <Route path={"/admin/clients"} component={AdminClients} />
      <Route path={"/admin/reviews"} component={AdminReviews} />
      <Route path={"/admin/voyants"} component={AdminVoyants} />
      <Route path={"/agent/dashboard"} component={AgentDashboard} />
      <Route path={"/agent/stats"} component={AgentStats} />
      <Route path={"/agent/profile"} component={AgentProfile} />
      <Route path={"/client/dashboard"} component={ClientDashboard} />
      <Route path={"/client/profile"} component={ClientProfile} />
      <Route path={"/client/checkout"} component={ClientCheckout} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
