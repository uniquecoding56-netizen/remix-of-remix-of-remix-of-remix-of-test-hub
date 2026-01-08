import type { StudyNotes } from '@/components/SummaryViewer';

interface NotesPDFData {
  notes: StudyNotes;
  title?: string;
}

export const generateNotesPDF = (data: NotesPDFData): void => {
  const { notes, title = 'Study Notes' } = data;

  // Generate HTML content
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
          line-height: 1.6;
          color: #333;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 2px solid #6366f1;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #6366f1;
          margin-bottom: 10px;
        }
        .app-description {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 15px;
          line-height: 1.5;
        }
        .title {
          font-size: 24px;
          color: #1f2937;
          margin-bottom: 10px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
        }
        .summary {
          font-size: 15px;
          line-height: 1.8;
          color: #374151;
          margin-bottom: 20px;
        }
        .key-points {
          list-style: none;
          padding: 0;
        }
        .key-points li {
          padding: 10px 15px;
          margin-bottom: 8px;
          background: #f9fafb;
          border-left: 3px solid #6366f1;
          border-radius: 4px;
        }
        .key-points li::before {
          content: "• ";
          color: #6366f1;
          font-weight: bold;
          margin-right: 8px;
        }
        .concept-item {
          margin-bottom: 20px;
          padding: 15px;
          background: #f9fafb;
          border-radius: 8px;
        }
        .concept-term {
          font-size: 18px;
          font-weight: 600;
          color: #6366f1;
          margin-bottom: 8px;
        }
        .concept-definition {
          font-size: 14px;
          color: #374151;
          margin-bottom: 8px;
        }
        .concept-importance {
          font-size: 13px;
          color: #6b7280;
          font-style: italic;
        }
        .quotes {
          list-style: none;
          padding: 0;
        }
        .quotes li {
          padding: 12px 15px;
          margin-bottom: 10px;
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          border-radius: 4px;
          font-style: italic;
        }
        .quotes li::before {
          content: """;
          color: #f59e0b;
          font-size: 20px;
          margin-right: 8px;
        }
        .action-items {
          list-style: none;
          padding: 0;
        }
        .action-items li {
          padding: 8px 15px;
          margin-bottom: 6px;
          background: #dbeafe;
          border-left: 3px solid #3b82f6;
          border-radius: 4px;
        }
        .action-items li::before {
          content: "☐ ";
          color: #3b82f6;
          margin-right: 8px;
        }
        .study-tips {
          list-style: none;
          padding: 0;
        }
        .study-tips li {
          padding: 10px 15px;
          margin-bottom: 8px;
          background: #d1fae5;
          border-left: 3px solid #10b981;
          border-radius: 4px;
        }
        .study-tips li::before {
          content: "💡 ";
          margin-right: 8px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #9ca3af;
          font-size: 12px;
        }
        @media print {
          body {
            padding: 20px;
          }
          .section {
            break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">📚 PDFStudy.online</div>
        <div class="app-description">
          PDFStudy.online is your comprehensive AI-powered study companion, transforming any content into interactive learning materials. 
          Generate smart flashcards, practice quizzes, detailed notes, and personalized study guides to accelerate your learning journey.
        </div>
        <div class="title">${title}</div>
      </div>

      ${notes.summary ? `
        <div class="section">
          <div class="section-title">Summary</div>
          <div class="summary">${notes.summary.replace(/\n/g, '<br>')}</div>
        </div>
      ` : ''}

      ${notes.keyPoints && notes.keyPoints.length > 0 ? `
        <div class="section">
          <div class="section-title">Key Points</div>
          <ul class="key-points">
            ${notes.keyPoints.map(point => `<li>${point}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${notes.keyConcepts && notes.keyConcepts.length > 0 ? `
        <div class="section">
          <div class="section-title">Key Concepts</div>
          ${notes.keyConcepts.map(concept => `
            <div class="concept-item">
              <div class="concept-term">${concept.term}</div>
              <div class="concept-definition"><strong>Definition:</strong> ${concept.definition}</div>
              <div class="concept-importance"><strong>Importance:</strong> ${concept.importance}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${notes.importantQuotes && notes.importantQuotes.length > 0 ? `
        <div class="section">
          <div class="section-title">Important Quotes</div>
          <ul class="quotes">
            ${notes.importantQuotes.map(quote => `<li>${quote}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${notes.actionItems && notes.actionItems.length > 0 ? `
        <div class="section">
          <div class="section-title">Action Items</div>
          <ul class="action-items">
            ${notes.actionItems.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${notes.studyTips && notes.studyTips.length > 0 ? `
        <div class="section">
          <div class="section-title">Study Tips</div>
          <ul class="study-tips">
            ${notes.studyTips.map(tip => `<li>${tip}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div class="footer">
        Generated by PDFStudy.online • ${new Date().toLocaleDateString('en-US', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        })}
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
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }
};


