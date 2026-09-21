import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import OwnerOnboarding from "./pages/OwnerOnboarding";
import PropertyDiscovery from "./pages/PropertyDiscovery";
import AdminVerification from "./pages/AdminVerification";
import { Route, Switch } from "wouter";

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Switch><Route path="/owner/onboard" component={OwnerOnboarding} /><Route path="/properties" component={PropertyDiscovery} /><Route path="/admin/verification" component={AdminVerification} /><Route component={Home} /></Switch></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
