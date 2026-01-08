import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { GraduationCap, Menu, ArrowRight } from 'lucide-react';

interface NavbarProps {
  showCTA?: boolean;
}

export function Navbar({ showCTA = true }: NavbarProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'Study Tools', href: '/#study-tools' },
    { label: 'Blog', href: '/blog' },
    { label: 'FAQ', href: '/faq' },
    { label: 'About', href: '/about' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith('/#')) {
      if (window.location.pathname === '/') {
        document.getElementById(href.replace('/#', ''))?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => {
          document.getElementById(href.replace('/#', ''))?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      navigate(href);
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 shadow-sm">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <span className="text-lg sm:text-xl font-bold text-foreground">PDFStudy</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />
          {showCTA && (
            <Button onClick={() => navigate('/auth')} className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Mobile Navigation */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle />
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-6">
              <div className="flex flex-col gap-6 mt-8">
                {showCTA && (
                  <Button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/auth');
                    }} 
                    className="w-full"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                <div className="space-y-4">
                  <p className="text-sm font-medium text-muted-foreground">Navigation</p>
                  {navLinks.map((link) => (
                    <button 
                      key={link.href}
                      onClick={() => handleNavClick(link.href)}
                      className="block text-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
                <div className="border-t border-border pt-4 space-y-4">
                  <p className="text-sm font-medium text-muted-foreground">Legal</p>
                  <Link to="/privacy" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
                  <Link to="/terms" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
                  <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-primary">Contact Us</Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
