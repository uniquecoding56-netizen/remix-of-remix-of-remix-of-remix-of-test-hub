import { SEOHead } from '@/components/SEOHead';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Privacy Policy - PDFStudy.online"
        description="Learn how PDFStudy.online collects, uses, and protects your personal data. Our privacy policy explains our commitment to your data security."
        keywords="pdfstudy privacy policy, data protection, user privacy, AI study tools privacy"
        canonicalUrl="https://pdfstudy.online/privacy"
      />
      <Navbar />
      
      <main className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
            <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 1, 2026</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                PDFStudy.online ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains 
                how we collect, use, disclose, and safeguard your information when you use our AI-powered study platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-foreground mb-3">2.1 Personal Information</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>Email address (for account creation and communication)</li>
                <li>Name (optional, for personalization)</li>
                <li>Profile information you choose to provide</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">2.2 Usage Data</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>Study materials you upload (PDFs, documents, links)</li>
                <li>Generated notes, flashcards, and tests</li>
                <li>Test attempts and scores</li>
                <li>Chat history with AI Master</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mb-3">2.3 Technical Data</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Usage patterns and analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use AI</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                PDFStudy.online uses artificial intelligence to provide our core services:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Processing documents to generate study materials</li>
                <li>Creating personalized flashcards and practice tests</li>
                <li>Powering the AI Master chat assistant</li>
                <li>Improving our AI models for better accuracy</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Your uploaded content is processed securely and is not shared with third parties for advertising purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
                <li>Encryption in transit (HTTPS/TLS)</li>
                <li>Encryption at rest for stored data</li>
                <li>Secure authentication systems</li>
                <li>Regular security audits and updates</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use essential cookies to maintain your session and preferences. We also use analytics cookies 
                to understand how users interact with our platform, helping us improve the experience.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed">You have the right to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data in a portable format</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your data for as long as your account is active. If you delete your account, 
                we will remove your personal data within 30 days, except where we are required by law to retain it.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service is intended for students of all ages. For users under 13, we recommend parental supervision. 
                We do not knowingly collect personal information from children without parental consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-muted-foreground mt-4">
                Email: <a href="mailto:privacy@pdfstudy.online" className="text-primary hover:underline">privacy@pdfstudy.online</a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
