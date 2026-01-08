import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedSection } from '@/hooks/useScrollAnimation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Star, 
  ArrowRight,
  Brain,
  FileText,
  BarChart3,
  Trophy,
  Clock,
  Sparkles,
  MessageSquare,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Zap,
  Upload,
  Youtube,
  FileAudio,
  Layers,
  Target,
  Lightbulb,
  Check,
  X,
  Play,
  Shield,
  Lock,
  Quote
} from 'lucide-react';

const features = [
  { icon: BookOpen, title: "Create Custom Tests", description: "Build personalized quizzes with MCQs, timers, and share with peers." },
  { icon: Brain, title: "AI Master Assistant", description: "Get instant help with Maths, Science, English through smart AI chat." },
  { icon: Sparkles, title: "Daily AI Tests", description: "Practice with auto-generated tests daily, tailored to CBSE curriculum." },
  { icon: FileText, title: "AI Test Generator", description: "Generate tests by class, subject, chapters, and difficulty level." },
  { icon: Download, title: "PDF Downloads", description: "Get detailed PDF reports with answers, scores, and analysis." },
  { icon: Trophy, title: "Leaderboards", description: "Compete with peers and track top performers across tests." },
  { icon: BarChart3, title: "Creator Analytics", description: "View insights on attempts, completion rates, and scores." },
  { icon: Star, title: "Ratings & Reviews", description: "Rate tests and read peer feedback to find best materials." },
  { icon: Filter, title: "Smart Filters", description: "Filter tests by class, category, subject, and difficulty." },
  { icon: Clock, title: "Timed Practice", description: "Simulate real exam conditions and improve your speed." }
];

const studyToolsFeatures = [
  { icon: Upload, title: "PDF to Notes", description: "Upload PDFs and get AI-generated comprehensive notes instantly.", color: "from-primary to-pink-500" },
  { icon: Youtube, title: "YouTube to Study", description: "Paste any YouTube link and convert lectures into study materials.", color: "from-destructive to-orange-500" },
  { icon: Layers, title: "Flashcard Generator", description: "Create flashcards from any content for spaced repetition learning.", color: "from-green-500 to-emerald-500" },
  { icon: Target, title: "Quiz Builder", description: "Transform study material into interactive practice quizzes.", color: "from-blue-500 to-cyan-500" },
  { icon: Lightbulb, title: "AI Q&A Tutor", description: "Ask questions about your content and get detailed AI explanations.", color: "from-purple-500 to-violet-500" },
  { icon: Shield, title: "Anti-Cheating Tests", description: "Practice honestly with tab-switch detection and secure test mode.", color: "from-orange-500 to-amber-500" }
];

const howItWorks = [
  { step: 1, title: "Upload Your Content", description: "Drop your PDF, paste a YouTube link, or type your study material. We support all formats.", icon: Upload },
  { step: 2, title: "AI Processes Everything", description: "Our AI analyzes your content and extracts key concepts, definitions, and important points.", icon: Brain },
  { step: 3, title: "Get Study Materials", description: "Receive AI-generated notes, flashcards, and practice tests tailored to your content.", icon: FileText },
  { step: 4, title: "Study & Ace Exams", description: "Use smart flashcards, take practice tests, and track your progress to exam success.", icon: Trophy }
];

const comparisonData = {
  features: [
    "AI-generated study notes",
    "Automatic flashcard creation",
    "Practice test generation",
    "YouTube video conversion",
    "24/7 AI tutor support",
    "Progress tracking",
    "Anti-cheating mode",
    "Free to use"
  ],
  pdfstudy: [true, true, true, true, true, true, true, true],
  traditional: [false, false, false, false, false, false, false, true],
  others: [true, true, false, false, false, true, false, false]
};

const testimonials = [
  { name: "Priya S.", role: "Class 12 Student, CBSE", content: "PDFStudy transformed how I prepare for exams. The AI notes from my textbook PDFs saved me hours of manual note-taking!", rating: 5 },
  { name: "Rahul M.", role: "Class 10 Student", content: "The flashcard generator is amazing! I went from struggling with memorization to getting 90+ in my boards.", rating: 5 },
  { name: "Ananya K.", role: "Medical Aspirant", content: "Converting YouTube lectures into notes is a game-changer. I can now review NEET content 3x faster.", rating: 5 },
  { name: "Vikram T.", role: "Engineering Student", content: "The AI tutor explains complex concepts better than some professors. It's like having a personal teacher 24/7.", rating: 5 }
];

const trustIndicators = [
  { icon: Shield, label: "Secure & Private", description: "Your data is encrypted and never sold" },
  { icon: Lock, label: "Privacy Focused", description: "We respect your study materials" },
  { icon: Users, label: "Student Friendly", description: "Built by students, for students" },
  { icon: Zap, label: "Always Free", description: "Core features free forever" }
];

export default function Index() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  const getSlidesPerView = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 1;
      if (window.innerWidth < 1024) return 2;
      return 3;
    }
    return 3;
  };

  const [slidesPerView, setSlidesPerView] = useState(getSlidesPerView());
  const totalSlides = Math.ceil(features.length / slidesPerView);

  useEffect(() => {
    const handleResize = () => setSlidesPerView(getSlidesPerView());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!loading && user) navigate('/dashboard');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % totalSlides), 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, totalSlides]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, []);

  const nextSlide = useCallback(() => goToSlide((currentSlide + 1) % totalSlides), [currentSlide, totalSlides, goToSlide]);
  const prevSlide = useCallback(() => goToSlide((currentSlide - 1 + totalSlides) % totalSlides), [currentSlide, totalSlides, goToSlide]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEOHead
        title="PDFStudy.online - AI Study Tool | PDF to Notes, Flashcards & Exams"
        description="Transform PDFs and videos into study notes, flashcards, and practice tests with AI. The best exam preparation tool for students. Start free!"
        keywords="AI study tool, PDF to notes, flashcard generator, exam preparation, study app, AI tutor, CBSE study"
        canonicalUrl="https://pdfstudy.online/"
      />
      
      <Navbar />

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-28 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" style={{ transform: `translateY(${scrollY * 0.1}px)` }} />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" style={{ transform: `translateY(${-scrollY * 0.15}px)` }} />
        
        <div className="relative text-center max-w-4xl mx-auto">
          <AnimatedSection animation="fade-down" delay={0}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              #1 AI Study Tool for Students
            </div>
          </AnimatedSection>
          
          <AnimatedSection animation="fade-up" delay={100}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Transform PDFs & Videos into
              <span className="text-primary block mt-2">Notes, Flashcards & Tests</span>
            </h1>
          </AnimatedSection>
          
          <AnimatedSection animation="fade-up" delay={200}>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Upload any PDF or YouTube video. Get AI-generated notes, smart flashcards, and practice tests instantly. 
              Study smarter, not harder. <strong>100% Free.</strong>
            </p>
          </AnimatedSection>
          
          <AnimatedSection animation="fade-up" delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')} 
                className="text-lg px-8 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload PDF Free
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-lg px-8 hover:scale-105 transition-all duration-300"
              >
                <Play className="mr-2 h-5 w-5" />
                See How It Works
              </Button>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={400}>
            <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> No credit card</span>
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Free forever</span>
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Works instantly</span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {trustIndicators.map((item, index) => (
            <AnimatedSection key={index} animation="zoom" delay={index * 100}>
              <Card className="text-center p-4 bg-card/50 backdrop-blur border-border/50 hover:shadow-lg transition-all duration-300">
                <item.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="font-semibold text-foreground text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From PDF to exam-ready in 4 simple steps. No learning curve required.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {howItWorks.map((step, index) => (
              <AnimatedSection key={index} animation="fade-up" delay={index * 150}>
                <div className="relative">
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -translate-x-1/2" />
                  )}
                  <Card className="p-6 bg-card border-border text-center h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                      {step.step}
                    </div>
                    <step.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </Card>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection animation="fade-up" delay={600}>
            <div className="text-center mt-10">
              <Button onClick={() => navigate('/auth')} size="lg" className="shadow-lg shadow-primary/20">
                Start Free Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Study Tools Features */}
      <section id="study-tools" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Zap className="w-4 h-4" />
                AI-Powered Tools
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Everything You Need to Ace Your Exams
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful AI study tools that transform any content into effective learning materials.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {studyToolsFeatures.map((feature, index) => (
              <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
                <Card className="group p-6 bg-card border-border hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full">
                  <CardContent className="p-0">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Students Choose PDFStudy
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                See how we compare to traditional studying and other tools
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={200}>
            <div className="max-w-4xl mx-auto overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">Feature</th>
                    <th className="p-4 text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold">
                        <GraduationCap className="w-4 h-4" /> PDFStudy
                      </div>
                    </th>
                    <th className="p-4 text-center font-medium text-muted-foreground">Traditional</th>
                    <th className="p-4 text-center font-medium text-muted-foreground">Other Tools</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.features.map((feature, index) => (
                    <tr key={index} className="border-t border-border">
                      <td className="p-4 text-foreground">{feature}</td>
                      <td className="p-4 text-center">
                        {comparisonData.pdfstudy[index] ? (
                          <Check className="w-5 h-5 text-primary mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {comparisonData.traditional[index] ? (
                          <Check className="w-5 h-5 text-primary mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {comparisonData.others[index] ? (
                          <Check className="w-5 h-5 text-primary mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features Carousel */}
      <section id="features" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">More Powerful Features</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                AI-powered tools and collaborative learning features
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={200}>
            <div className="relative max-w-6xl mx-auto">
              <button onClick={prevSlide} className="absolute -left-2 md:-left-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:bg-accent transition-all" aria-label="Previous">
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button onClick={nextSlide} className="absolute -right-2 md:-right-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background border border-border shadow-lg flex items-center justify-center hover:bg-accent transition-all" aria-label="Next">
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <div className="overflow-hidden px-8 md:px-0">
                <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                  {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                    <div key={slideIndex} className="flex gap-4 md:gap-6 min-w-full">
                      {features.slice(slideIndex * slidesPerView, slideIndex * slidesPerView + slidesPerView).map((feature, index) => (
                        <Card key={index} className="flex-1 min-w-0 p-6 bg-card border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                          <CardContent className="p-0">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
                              <feature.icon className="h-7 w-7 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground text-sm">{feature.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button key={index} onClick={() => goToSlide(index)} className={`h-2.5 rounded-full transition-all ${currentSlide === index ? 'w-8 bg-primary' : 'w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'}`} aria-label={`Slide ${index + 1}`} />
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Loved by Students Everywhere
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                See what students are saying about PDFStudy.online
              </p>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
                <Card className="p-6 bg-card border-border h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-0 flex flex-col h-full">
                    <Quote className="w-8 h-8 text-primary/30 mb-4" />
                    <p className="text-muted-foreground text-sm mb-4 flex-grow">"{testimonial.content}"</p>
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* AI Master Feature */}
      <section id="ai-master" className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5 pointer-events-none" style={{ transform: `translateY(${scrollY * 0.03}px)` }} />
        
        <div className="relative container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <AnimatedSection animation="fade-right" className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Brain className="w-4 h-4" />
                AI Powered
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Meet AI Master</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Your personal AI study assistant. Ask questions about any subject - Maths, Science, English, or even app usage. Available 24/7.
              </p>
              <ul className="space-y-3 mb-6">
                {["Subject-specific help for all topics", "Image recognition for homework problems", "Persistent chat history", "Exam-focused explanations"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center"><MessageSquare className="w-3 h-3 text-primary" /></div>
                    {item}
                  </li>
                ))}
              </ul>
              <Button onClick={() => navigate('/auth')} className="shadow-lg shadow-primary/20">
                Try AI Master <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </AnimatedSection>
            
            <AnimatedSection animation="fade-left" delay={200} className="order-1 md:order-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur-3xl" />
                <Card className="relative bg-card border-border p-6 md:p-8 rounded-3xl">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">AI Master</p>
                      <p className="text-xs text-muted-foreground">Online • Ready to help</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-br-md max-w-[85%]">
                        <p className="text-sm">Explain Newton's first law of motion</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-md max-w-[85%]">
                        <p className="text-sm text-foreground">Newton's First Law states that an object at rest stays at rest, and an object in motion stays in motion with the same speed and direction unless acted upon by an unbalanced force. This is also called the Law of Inertia!</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="zoom">
            <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 via-background to-purple-500/10 border-primary/20 p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Ready to Study Smarter?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of students who are already using AI to ace their exams. 
                  Upload your first PDF and see the magic happen. <strong>It's 100% free!</strong>
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all">
                    <Upload className="mr-2 h-5 w-5" />
                    Upload PDF Free
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="text-lg px-8 hover:scale-105 transition-all">
                    Create Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-6">No credit card required • Free forever • Works instantly</p>
              </div>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <AnimatedSection animation="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Have Questions?</h2>
            <p className="text-lg text-muted-foreground mb-8">Check out our frequently asked questions</p>
            <Link to="/faq" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors">
              View FAQ <ArrowRight className="w-4 h-4" />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
