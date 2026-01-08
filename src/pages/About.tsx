import { SEOHead } from '@/components/SEOHead';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Target, Users, Heart, Lightbulb, Shield, Globe } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: "Student-Centric",
    description: "Everything we build starts with students' needs. We design tools that make learning more efficient and effective."
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We leverage cutting-edge AI technology to transform how students interact with study materials."
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data belongs to you. We never sell personal information and use industry-standard encryption."
  },
  {
    icon: Globe,
    title: "Accessibility",
    description: "Quality education tools should be available to everyone, regardless of location or background."
  }
];

const team = [
  {
    name: "PDFStudy Team",
    role: "Building the Future of Learning",
    description: "A passionate team of educators, developers, and designers dedicated to making learning more accessible."
  }
];

export default function About() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PDFStudy.online",
    "description": "AI-powered study platform that transforms PDFs and videos into comprehensive study materials",
    "url": "https://pdfstudy.online",
    "logo": "https://pdfstudy.online/logo.png",
    "sameAs": [
      "https://twitter.com/pdfstudy"
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="About Us - PDFStudy.online | AI Study Platform for Students"
        description="Learn about PDFStudy.online, our mission to revolutionize education through AI-powered study tools, and our commitment to student success."
        keywords="about pdfstudy, AI study platform, education technology, student learning tools"
        canonicalUrl="https://pdfstudy.online/about"
        jsonLd={jsonLd}
      />
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24 relative overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <GraduationCap className="w-4 h-4" />
              Our Story
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Empowering Students with
              <span className="text-primary block">AI-Powered Learning</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              PDFStudy.online was created with a simple mission: make studying more efficient, 
              effective, and accessible for every student around the world.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <Card className="p-8 bg-card border-border">
                <CardContent className="p-0">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <Target className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    To democratize education by providing AI-powered study tools that transform any 
                    learning material into effective, personalized study resources. We believe that 
                    every student deserves access to smart learning technology.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="p-8 bg-card border-border">
                <CardContent className="p-0">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <Lightbulb className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Our Vision</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    A world where learning is personalized, efficient, and engaging. We envision 
                    AI as a study companion that adapts to each student's unique learning style, 
                    helping them achieve their academic goals faster.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Values</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                These core principles guide everything we do at PDFStudy.online
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {values.map((value, index) => (
                <Card key={index} className="p-6 bg-card border-border hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* What We Offer */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">What We Offer</h2>
                <p className="text-lg text-muted-foreground">
                  Comprehensive AI study tools designed for modern learners
                </p>
              </div>
              
              <div className="space-y-4">
                {[
                  "Transform PDFs into concise, comprehensive notes automatically",
                  "Generate flashcards for effective spaced repetition learning",
                  "Create practice tests from any study material",
                  "Convert YouTube videos into study guides",
                  "AI tutor that answers questions about your content",
                  "Anti-cheating test mode for honest self-assessment"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold text-sm">{index + 1}</span>
                    </div>
                    <p className="text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Join Our Learning Community
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Have questions or feedback? We'd love to hear from you. Together, we can make learning better for everyone.
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Contact Us
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
