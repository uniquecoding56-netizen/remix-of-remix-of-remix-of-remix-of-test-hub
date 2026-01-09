interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface QAPDFData {
  messages: Message[];
  content: string;
  title?: string;
}

export const generateQAPDF = (data: QAPDFData): void => {
  const { messages, content, title = 'AI Q&A Conversation' } = data;

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
          margin-bottom: 35px;
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
          font-size: 26px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 10px;
        }
        .date {
          font-size: 12px;
          color: #9ca3af;
        }
        .content-preview {
          font-size: 13px;
          color: #6b7280;
          margin: 20px 0;
          padding: 15px;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-radius: 10px;
          border-left: 4px solid #6366f1;
          max-height: 120px;
          overflow: hidden;
        }
        .content-preview strong {
          color: #6366f1;
        }
        .conversation {
          margin-top: 30px;
        }
        .message {
          margin-bottom: 20px;
          padding: 18px 22px;
          border-radius: 12px;
          page-break-inside: avoid;
        }
        .message-user {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          margin-left: 50px;
          border-bottom-right-radius: 4px;
        }
        .message-assistant {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          margin-right: 50px;
          border-bottom-left-radius: 4px;
        }
        .message-role {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 10px;
        }
        .message-user .message-role {
          color: rgba(255,255,255,0.85);
        }
        .message-assistant .message-role {
          color: #6366f1;
        }
        .message-content {
          font-size: 15px;
          color: inherit;
          line-height: 1.8;
        }
        .message-user .message-content {
          color: white;
        }
        .message-assistant .message-content {
          color: #374151;
        }
        .message-content p {
          margin-bottom: 10px;
        }
        .message-content ul, .message-content ol {
          margin-left: 20px;
          margin-bottom: 10px;
        }
        .message-content li {
          margin-bottom: 5px;
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
          .message {
            break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">📚 PDFStudy.online</div>
        <div class="tagline">AI-Powered Study Companion • Interactive Learning</div>
        <div class="title">${title}</div>
        <div class="date">Generated on ${new Date().toLocaleDateString('en-US', { 
          weekday: 'long',
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        })}</div>
      </div>

      ${content ? `
        <div class="content-preview">
          <strong>📄 Source Content:</strong><br>
          ${content.substring(0, 300)}${content.length > 300 ? '...' : ''}
        </div>
      ` : ''}

      <div class="conversation">
        ${messages.map((message) => `
          <div class="message message-${message.role}">
            <div class="message-role">${message.role === 'user' ? '👤 You Asked' : '🤖 AI Tutor Response'}</div>
            <div class="message-content">${message.content.replace(/\n/g, '<br>')}</div>
          </div>
        `).join('')}
      </div>

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
