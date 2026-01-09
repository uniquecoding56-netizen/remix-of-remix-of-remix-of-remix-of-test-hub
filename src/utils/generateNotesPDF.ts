import type { StudyNotes } from '@/components/SummaryViewer';

interface NotesPDFData {
  notes: StudyNotes;
  title?: string;
}

export const generateNotesPDF = (data: NotesPDFData): void => {
  const { notes, title = 'Study Notes' } = data;

  // Generate professional HTML content with PDFStudy branding
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title} - PDFStudy.online</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.7;
          color: #1f2937;
          padding: 50px;
          max-width: 850px;
          margin: 0 auto;
          background: white;
        }
        .header {
          text-align: center;
          padding-bottom: 30px;
          border-bottom: 3px solid #6366f1;
          margin-bottom: 40px;
          position: relative;
        }
        .header::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 3px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
        }
        .logo {
          font-size: 36px;
          font-weight: 800;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 8px;
        }
        .tagline {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 20px;
          font-style: italic;
        }
        .title {
          font-size: 28px;
          color: #1f2937;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .date {
          font-size: 12px;
          color: #9ca3af;
        }
        .section {
          margin-bottom: 35px;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 22px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 18px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .section-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
        }
        .summary {
          font-size: 16px;
          line-height: 1.9;
          color: #374151;
          text-align: justify;
          padding: 20px;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-radius: 12px;
          border-left: 4px solid #6366f1;
        }
        .key-points {
          list-style: none;
          padding: 0;
        }
        .key-points li {
          padding: 14px 18px;
          margin-bottom: 10px;
          background: #f8fafc;
          border-left: 4px solid #6366f1;
          border-radius: 0 8px 8px 0;
          font-size: 15px;
          line-height: 1.6;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .key-points li::before {
          content: "✓";
          color: #6366f1;
          font-weight: bold;
          font-size: 14px;
          background: #e0e7ff;
          padding: 2px 8px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .concept-item {
          margin-bottom: 20px;
          padding: 20px;
          background: linear-gradient(135deg, #faf5ff, #f3e8ff);
          border-radius: 12px;
          border: 1px solid #e9d5ff;
        }
        .concept-term {
          font-size: 20px;
          font-weight: 700;
          color: #7c3aed;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .concept-term::before {
          content: "💡";
        }
        .concept-definition {
          font-size: 15px;
          color: #374151;
          margin-bottom: 10px;
          line-height: 1.7;
        }
        .concept-importance {
          font-size: 14px;
          color: #6b7280;
          font-style: italic;
          padding: 10px;
          background: white;
          border-radius: 6px;
          border-left: 3px solid #a78bfa;
        }
        .quotes {
          list-style: none;
          padding: 0;
        }
        .quotes li {
          padding: 18px 22px;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #fefce8, #fef9c3);
          border-left: 4px solid #eab308;
          border-radius: 0 12px 12px 0;
          font-style: italic;
          font-size: 15px;
          color: #713f12;
          line-height: 1.7;
          position: relative;
        }
        .quotes li::before {
          content: """;
          color: #eab308;
          font-size: 32px;
          position: absolute;
          left: 10px;
          top: 5px;
          opacity: 0.5;
        }
        .action-items {
          list-style: none;
          padding: 0;
        }
        .action-items li {
          padding: 12px 18px;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          border-left: 4px solid #3b82f6;
          border-radius: 0 8px 8px 0;
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .action-items li::before {
          content: "☐";
          color: #3b82f6;
          font-size: 18px;
          font-weight: bold;
        }
        .study-tips {
          list-style: none;
          padding: 0;
        }
        .study-tips li {
          padding: 14px 18px;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          border-left: 4px solid #10b981;
          border-radius: 0 8px 8px 0;
          font-size: 15px;
          line-height: 1.6;
        }
        .study-tips li::before {
          content: "💡 ";
        }
        .footer {
          margin-top: 50px;
          padding-top: 25px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
        }
        .footer-logo {
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 8px;
        }
        .footer-text {
          color: #9ca3af;
          font-size: 12px;
          margin-bottom: 5px;
        }
        .footer-url {
          color: #6366f1;
          font-size: 14px;
          font-weight: 600;
        }
        @media print {
          body {
            padding: 30px;
          }
          .section {
            break-inside: avoid;
          }
          .concept-item {
            break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">📚 PDFStudy.online</div>
        <div class="tagline">AI-Powered Study Companion • Transform Content into Knowledge</div>
        <div class="title">${title}</div>
        <div class="date">Generated on ${new Date().toLocaleDateString('en-US', { 
          weekday: 'long',
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        })}</div>
      </div>

      ${notes.summary ? `
        <div class="section">
          <div class="section-title">
            <div class="section-icon">📝</div>
            Summary
          </div>
          <div class="summary">${notes.summary.replace(/\n/g, '<br>')}</div>
        </div>
      ` : ''}

      ${notes.keyPoints && notes.keyPoints.length > 0 ? `
        <div class="section">
          <div class="section-title">
            <div class="section-icon">🎯</div>
            Key Points
          </div>
          <ul class="key-points">
            ${notes.keyPoints.map(point => `<li>${point}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${notes.keyConcepts && notes.keyConcepts.length > 0 ? `
        <div class="section">
          <div class="section-title">
            <div class="section-icon">💡</div>
            Key Concepts
          </div>
          ${notes.keyConcepts.map(concept => `
            <div class="concept-item">
              <div class="concept-term">${concept.term}</div>
              <div class="concept-definition"><strong>Definition:</strong> ${concept.definition}</div>
              <div class="concept-importance"><strong>Why it matters:</strong> ${concept.importance}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${notes.importantQuotes && notes.importantQuotes.length > 0 ? `
        <div class="section">
          <div class="section-title">
            <div class="section-icon">💬</div>
            Important Quotes
          </div>
          <ul class="quotes">
            ${notes.importantQuotes.map(quote => `<li>${quote}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${notes.actionItems && notes.actionItems.length > 0 ? `
        <div class="section">
          <div class="section-title">
            <div class="section-icon">✅</div>
            Action Items
          </div>
          <ul class="action-items">
            ${notes.actionItems.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${notes.studyTips && notes.studyTips.length > 0 ? `
        <div class="section">
          <div class="section-title">
            <div class="section-icon">📖</div>
            Study Tips
          </div>
          <ul class="study-tips">
            ${notes.studyTips.map(tip => `<li>${tip}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div class="footer">
        <div class="footer-logo">📚 PDFStudy.online</div>
        <div class="footer-text">Your AI-Powered Learning Platform</div>
        <div class="footer-text">Transform any content into interactive study materials</div>
        <div class="footer-url">www.pdfstudy.online</div>
      </div>
    </body>
    </html>
  `;

  // Create and download PDF using print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then trigger print
    setTimeout(() => {
      printWindow.print();
    }, 300);
  }
};
