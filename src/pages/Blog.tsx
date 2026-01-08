import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

const blogPosts = [
  {
    slug: "how-to-study-effectively-with-ai",
    title: "How to Study Effectively with AI Tools in 2026",
    excerpt: "Discover the best strategies for using AI-powered study tools to maximize your learning efficiency and ace your exams.",
    category: "Study Tips",
    date: "Jan 1, 2026",
    readTime: "5 min read"
  },
  {
    slug: "flashcard-techniques-for-better-memory",
    title: "Flashcard Techniques for Better Memory Retention",
    excerpt: "Learn scientifically-proven flashcard methods including spaced repetition to remember more in less time.",
    category: "Learning Science",
    date: "Dec 28, 2025",
    readTime: "7 min read"
  },
  {
    slug: "convert-pdf-notes-guide",
    title: "Complete Guide to Converting PDFs into Study Notes",
    excerpt: "Step-by-step guide on using AI to transform your textbook PDFs into concise, actionable study notes.",
    category: "Tutorials",
    date: "Dec 25, 2025",
    readTime: "6 min read"
  },
  {
    slug: "exam-preparation-strategies",
    title: "Top 10 Exam Preparation Strategies for Students",
    excerpt: "Expert-backed strategies to prepare for exams efficiently, reduce stress, and perform your best.",
    category: "Exam Prep",
    date: "Dec 20, 2025",
    readTime: "8 min read"
  }
];

export default function Blog() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "PDFStudy Blog",
    "description": "Study tips, exam preparation guides, and learning strategies for students",
    "url": "https://pdfstudy.online/blog"
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Blog - PDFStudy.online | Study Tips & Exam Preparation Guides"
        description="Explore study tips, exam preparation strategies, and AI learning guides on the PDFStudy blog. Improve your grades with expert advice."
        keywords="study tips, exam preparation, AI study guide, flashcard techniques, learning strategies"
        canonicalUrl="https://pdfstudy.online/blog"
        jsonLd={jsonLd}
      />
      <Navbar />
      
      <main className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Study Blog</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tips, guides, and strategies to help you study smarter and achieve your academic goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {blogPosts.map((post) => (
              <Card key={post.slug} className="group hover:shadow-lg transition-shadow bg-card border-border overflow-hidden">
                <CardContent className="p-6">
                  <Badge variant="secondary" className="mb-4">{post.category}</Badge>
                  <h2 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{post.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{post.readTime}</span>
                    </div>
                    <span className="text-primary flex items-center gap-1 text-sm font-medium">
                      Read <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
