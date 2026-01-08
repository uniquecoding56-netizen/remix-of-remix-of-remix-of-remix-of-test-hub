import { useState } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Search, HelpCircle } from 'lucide-react';

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        question: "What is PDFStudy.online?",
        answer: "PDFStudy.online is an AI-powered study platform that transforms your PDFs, documents, and YouTube videos into comprehensive notes, flashcards, and practice tests. It's designed to help students study more efficiently."
      },
      {
        question: "How do I create an account?",
        answer: "Click the 'Get Started' button on our homepage and sign up with your email address. You can start using the platform immediately after creating your account."
      },
      {
        question: "Is PDFStudy.online free to use?",
        answer: "Yes! PDFStudy.online offers free access to core features. You can upload documents, generate notes, create flashcards, and take practice tests at no cost."
      }
    ]
  },
  {
    category: "AI Study Tools",
    questions: [
      {
        question: "How does the AI note generator work?",
        answer: "Simply upload your PDF or paste a YouTube link. Our AI analyzes the content and generates comprehensive, well-organized notes highlighting key concepts, definitions, and important information."
      },
      {
        question: "What file formats are supported?",
        answer: "We support PDF, Word documents (.docx), PowerPoint presentations (.pptx), and various audio/video formats. You can also paste YouTube video links for transcription and study material generation."
      },
      {
        question: "How accurate is the AI-generated content?",
        answer: "Our AI is highly accurate for most educational content. However, we recommend reviewing generated materials to ensure they meet your specific study needs. The AI works best with clear, well-structured content."
      },
      {
        question: "Can I edit the generated notes and flashcards?",
        answer: "Currently, the system generates study materials based on your uploaded content. We're working on adding editing features in future updates."
      }
    ]
  },
  {
    category: "Tests & Quizzes",
    questions: [
      {
        question: "How do I create a practice test?",
        answer: "You can create tests in two ways: 1) Upload a document and our AI will generate questions from it, or 2) Use the AI Test Generator to create tests by selecting your class, subject, and topic."
      },
      {
        question: "What is the anti-cheating feature?",
        answer: "Our anti-cheating mode disables tab switching and screen recording during tests, ensuring honest self-assessment. This helps students accurately gauge their knowledge."
      },
      {
        question: "Can I share tests with other students?",
        answer: "Yes! All tests you create can be discovered by other students on the platform. You can also share direct links to your tests."
      },
      {
        question: "How many questions can a test have?",
        answer: "You can generate tests with anywhere from 5 to 100 questions, depending on your study needs."
      }
    ]
  },
  {
    category: "Account & Privacy",
    questions: [
      {
        question: "Is my data secure?",
        answer: "Yes, we take security seriously. All data is encrypted in transit and at rest. We use industry-standard security practices and never sell your personal information."
      },
      {
        question: "Who can see my uploaded documents?",
        answer: "Your uploaded documents are private by default. Only you can access your original files. The study materials you create (notes, flashcards, tests) can be shared if you choose."
      },
      {
        question: "Can I delete my account?",
        answer: "Yes, you can delete your account at any time through your account settings. This will remove all your data from our servers."
      }
    ]
  },
  {
    category: "Technical Issues",
    questions: [
      {
        question: "Why is my PDF not uploading?",
        answer: "Ensure your PDF is under the file size limit and not password-protected. If issues persist, try refreshing the page or using a different browser."
      },
      {
        question: "The AI is taking too long to generate content. What should I do?",
        answer: "For large documents, processing may take a few minutes. If it takes longer than 5 minutes, try uploading a smaller portion of the content or refresh the page."
      },
      {
        question: "How do I report a bug or issue?",
        answer: "Please visit our Contact page or email support@pdfstudy.online with details about the issue you're experiencing. Include screenshots if possible."
      }
    ]
  }
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.flatMap(cat => cat.questions.map(q => ({
      "@type": "Question",
      "name": q.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answer
      }
    })))
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="FAQ - PDFStudy.online | Frequently Asked Questions"
        description="Find answers to common questions about PDFStudy.online. Learn how to use AI study tools, create flashcards, generate practice tests, and more."
        keywords="pdfstudy FAQ, AI study tools help, how to use pdfstudy, study platform questions"
        canonicalUrl="https://pdfstudy.online/faq"
        jsonLd={jsonLd}
      />
      <Navbar />
      
      <main className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <HelpCircle className="w-4 h-4" />
              Help Center
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Find answers to common questions about PDFStudy.online
            </p>
            
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg"
              />
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {filteredFaqs.map((category, catIndex) => (
              <div key={catIndex}>
                <h2 className="text-xl font-semibold text-foreground mb-4">{category.category}</h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem 
                      key={faqIndex} 
                      value={`${catIndex}-${faqIndex}`}
                      className="border border-border rounded-lg px-4 bg-card"
                    >
                      <AccordionTrigger className="text-left font-medium hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}

            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>

          <div className="text-center mt-16">
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <a 
              href="/contact" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
