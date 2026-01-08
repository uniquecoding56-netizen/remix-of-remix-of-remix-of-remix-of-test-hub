import { SEOHead } from '@/components/SEOHead';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Disclaimer - PDFStudy.online"
        description="Important disclaimers about using PDFStudy.online. Understand the limitations of AI-generated study materials."
        keywords="pdfstudy disclaimer, AI limitations, educational disclaimer"
        canonicalUrl="https://pdfstudy.online/disclaimer"
      />
      <Navbar />
      
      <main className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
            <h1 className="text-4xl font-bold text-foreground mb-8">Disclaimer</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 1, 2026</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Educational Purpose</h2>
              <p className="text-muted-foreground leading-relaxed">
                PDFStudy.online is designed to be a supplementary educational tool. The content generated 
                by our AI is intended to assist with studying and should not be considered a replacement 
                for official textbooks, classroom instruction, or professional academic guidance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">AI-Generated Content Accuracy</h2>
              <p className="text-muted-foreground leading-relaxed">
                While we strive to provide accurate and helpful study materials, AI-generated content may:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
                <li>Contain factual errors or inaccuracies</li>
                <li>Misinterpret complex or nuanced information</li>
                <li>Provide incomplete explanations</li>
                <li>Generate outdated information</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong className="text-foreground">Always verify important information</strong> with authoritative sources, 
                textbooks, or your instructors before relying on it for exams or academic work.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">No Professional Advice</h2>
              <p className="text-muted-foreground leading-relaxed">
                The content provided by PDFStudy.online does not constitute professional, academic, legal, 
                medical, or financial advice. For matters requiring professional expertise, please consult 
                with qualified professionals.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Content</h2>
              <p className="text-muted-foreground leading-relaxed">
                When processing YouTube videos or external content, we rely on third-party transcriptions 
                and content. We are not responsible for the accuracy or quality of content from external sources.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">No Guarantee of Results</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not guarantee that using PDFStudy.online will result in improved grades, test scores, 
                or academic performance. Learning outcomes depend on many factors including individual effort, 
                study habits, and other circumstances beyond our control.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Service Availability</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not guarantee uninterrupted access to our services. The platform may experience 
                downtime for maintenance, updates, or unforeseen technical issues.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">User Responsibility</h2>
              <p className="text-muted-foreground leading-relaxed">
                Users are responsible for:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
                <li>Ensuring they have the right to upload content to our platform</li>
                <li>Verifying the accuracy of AI-generated study materials</li>
                <li>Using the service in compliance with their institution's academic integrity policies</li>
                <li>Not using AI-generated content for academic dishonesty or plagiarism</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the fullest extent permitted by law, PDFStudy.online shall not be liable for any 
                damages arising from:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
                <li>Reliance on AI-generated content</li>
                <li>Errors or omissions in study materials</li>
                <li>Loss of data or service interruptions</li>
                <li>Academic consequences resulting from use of our service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions or concerns about this disclaimer, please contact us at:
              </p>
              <p className="text-muted-foreground mt-4">
                Email: <a href="mailto:support@pdfstudy.online" className="text-primary hover:underline">support@pdfstudy.online</a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
