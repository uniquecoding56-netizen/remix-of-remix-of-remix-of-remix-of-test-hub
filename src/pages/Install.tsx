import { SEOHead } from '@/components/SEOHead';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Smartphone, Zap, Wifi, Bell, Check } from 'lucide-react';

const benefits = [
  { icon: Zap, title: "Lightning Fast", description: "App loads instantly, faster than a website" },
  { icon: Wifi, title: "Works Offline", description: "Study even without internet connection" },
  { icon: Bell, title: "Notifications", description: "Get reminders for daily practice tests" },
  { icon: Smartphone, title: "Home Screen", description: "Quick access like any native app" }
];

const iosSteps = [
  "Open PDFStudy.online in Safari",
  "Tap the Share button (square with arrow)",
  "Scroll down and tap 'Add to Home Screen'",
  "Tap 'Add' to confirm"
];

const androidSteps = [
  "Open PDFStudy.online in Chrome",
  "Tap the menu (three dots)",
  "Tap 'Add to Home screen' or 'Install app'",
  "Tap 'Install' to confirm"
];

export default function Install() {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Install PDFStudy App - Study Offline | PDFStudy.online"
        description="Install PDFStudy on your phone for faster access and offline studying. Works on iPhone and Android."
        keywords="install pdfstudy, study app, offline study, mobile app"
        canonicalUrl="https://pdfstudy.online/install"
      />
      <Navbar />
      
      <main className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Smartphone className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Install PDFStudy
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Add PDFStudy to your home screen for instant access, offline studying, and a native app experience.
            </p>
          </div>

          {/* Install Button (Chrome/Edge on desktop/Android) */}
          {isInstallable && !isInstalled && (
            <div className="text-center mb-12">
              <Button size="lg" onClick={installApp} className="text-lg px-8 shadow-lg shadow-primary/25">
                <Download className="mr-2 h-5 w-5" />
                Install App Now
              </Button>
            </div>
          )}

          {isInstalled && (
            <Card className="max-w-md mx-auto p-6 mb-12 bg-primary/10 border-primary/20">
              <div className="flex items-center gap-3 text-primary">
                <Check className="w-6 h-6" />
                <span className="font-semibold">PDFStudy is installed!</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                You can now access PDFStudy from your home screen.
              </p>
            </Card>
          )}

          {/* Benefits */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 bg-card border-border text-center">
                <CardContent className="p-0">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Manual Installation Instructions */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Manual Installation
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* iOS Instructions */}
              <Card className={`p-6 bg-card border-border ${isIOS ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-lg">🍎</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">iPhone / iPad</h3>
                      <p className="text-xs text-muted-foreground">Safari browser</p>
                    </div>
                  </div>
                  <ol className="space-y-3">
                    {iosSteps.map((step, index) => (
                      <li key={index} className="flex gap-3 text-sm">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              {/* Android Instructions */}
              <Card className={`p-6 bg-card border-border ${isAndroid ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-lg">🤖</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Android</h3>
                      <p className="text-xs text-muted-foreground">Chrome browser</p>
                    </div>
                  </div>
                  <ol className="space-y-3">
                    {androidSteps.map((step, index) => (
                      <li key={index} className="flex gap-3 text-sm">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
