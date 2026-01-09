import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AIMasterChat } from "@/components/AIMasterChat";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { NotificationSystem } from "@/components/NotificationSystem";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import TakeTest from "./pages/TakeTest";
import History from "./pages/History";
import StudyTools from "./pages/StudyTools";
import SavedFlashcards from "./pages/SavedFlashcards";
import SavedContent from "./pages/SavedContent";
import SharedContent from "./pages/SharedContent";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Disclaimer from "./pages/Disclaimer";
import Blog from "./pages/Blog";
import Install from "./pages/Install";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/test/:id" element={<TakeTest />} />
              <Route path="/history" element={<History />} />
              <Route path="/study-tools" element={<StudyTools />} />
              <Route path="/saved-flashcards" element={<SavedFlashcards />} />
              <Route path="/saved-content" element={<SavedContent />} />
              <Route path="/shared/:shareToken" element={<SharedContent />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/install" element={<Install />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AIMasterChat />
            <PWAInstallPrompt />
            <NotificationSystem />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
