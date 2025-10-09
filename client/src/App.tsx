import { Router, Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import ShareView from "@/pages/ShareView";
import NotFound from "@/pages/not-found";

function Routes() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/home" component={Home} />
      <Route path="/share/:id" component={ShareView} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Use base path for GitHub Pages deployment, empty for local dev
  const basePath = import.meta.env.PROD ? "/MentalBiriyani" : "";
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router base={basePath}>
          <Toaster />
          <Routes />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
