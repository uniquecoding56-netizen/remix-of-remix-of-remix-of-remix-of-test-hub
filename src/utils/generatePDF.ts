import { Question } from '@/types/test';

interface TestPDFData {
  title: string;
  description: string | null;
  questions: Question[];
  answers: Record<string, number>;
  score: number;
  totalQuestions: number;
  completedAt: Date;
  studentName?: string;
}

export const generateTestPDF = (data: TestPDFData): void => {
  const {
    title,
    description,
    questions,
    answers,
    score,
    totalQuestions,
    completedAt,
    studentName = 'Student',
  } = data;

  const percentage = Math.round((score / totalQuestions) * 100);
  const dateStr = completedAt.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = completedAt.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Generate professional HTML content with PDFStudy branding
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title} - Test Results | PDFStudy.online</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          padding: 50px;
          max-width: 850px;
          margin: 0 auto;
          background: white;
        }
        .header {
          text-align: center;
          padding-bottom: 25px;
          border-bottom: 3px solid #6366f1;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 32px;
          font-weight: 800;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 8px;
        }
        .tagline {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 15px;
        }
        .title {
          font-size: 26px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 5px;
        }
        .subtitle {
          color: #6b7280;
          font-size: 14px;
        }
        .score-card {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          padding: 30px;
          border-radius: 16px;
          text-align: center;
          margin-bottom: 30px;
          box-shadow: 0 10px 40px rgba(99, 102, 241, 0.3);
        }
        .score-value {
          font-size: 56px;
          font-weight: 800;
          margin-bottom: 5px;
        }
        .score-label {
          font-size: 18px;
          opacity: 0.9;
        }
        .score-badge {
          display: inline-block;
          margin-top: 12px;
          padding: 6px 16px;
          background: rgba(255,255,255,0.2);
          border-radius: 20px;
          font-size: 14px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }
        .info-item {
          background: #f8fafc;
          padding: 15px 18px;
          border-radius: 10px;
          border-left: 4px solid #6366f1;
        }
        .info-label {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .info-value {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }
        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 18px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .question-item {
          margin-bottom: 25px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
          page-break-inside: avoid;
        }
        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .question-number {
          font-weight: 700;
          color: #6366f1;
          font-size: 14px;
        }
        .question-status {
          font-size: 12px;
          padding: 4px 12px;
          border-radius: 12px;
          font-weight: 600;
        }
        .correct {
          background: #d1fae5;
          color: #065f46;
        }
        .incorrect {
          background: #fee2e2;
          color: #991b1b;
        }
        .question-text {
          font-size: 16px;
          margin-bottom: 15px;
          color: #1f2937;
          font-weight: 500;
        }
        .options-list {
          list-style: none;
          margin-bottom: 10px;
        }
        .option-item {
          padding: 10px 14px;
          margin-bottom: 6px;
          border-radius: 8px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .option-marker {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .user-answer {
          background: #fef3c7;
          border: 2px solid #f59e0b;
        }
        .correct-answer {
          background: #d1fae5;
          border: 2px solid #10b981;
        }
        .user-answer .option-marker {
          background: #f59e0b;
          color: white;
        }
        .correct-answer .option-marker {
          background: #10b981;
          color: white;
        }
        .normal-option {
          background: white;
          border: 1px solid #e5e7eb;
        }
        .normal-option .option-marker {
          background: #e5e7eb;
          color: #6b7280;
        }
        .answer-note {
          font-size: 13px;
          color: #6b7280;
          margin-top: 10px;
          padding: 10px;
          background: white;
          border-radius: 6px;
          border-left: 3px solid #f59e0b;
        }
        .footer {
          margin-top: 50px;
          padding-top: 25px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
        }
        .footer-logo {
          font-size: 22px;
          font-weight: 700;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 8px;
        }
        .footer-text {
          color: #9ca3af;
          font-size: 12px;
        }
        @media print {
          body {
            padding: 30px;
          }
          .question-item {
            break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">📚 PDFStudy.online</div>
        <div class="tagline">AI-Powered Study Companion</div>
        <div class="title">${title}</div>
        ${description ? `<div class="subtitle">${description}</div>` : ''}
      </div>

      <div class="score-card">
        <div class="score-value">${score}/${totalQuestions}</div>
        <div class="score-label">${percentage}% Score</div>
        <div class="score-badge">${percentage >= 80 ? '🌟 Excellent!' : percentage >= 60 ? '👍 Good Job!' : '📚 Keep Learning!'}</div>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Student Name</div>
          <div class="info-value">${studentName}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Date</div>
          <div class="info-value">${dateStr}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Time</div>
          <div class="info-value">${timeStr}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Total Questions</div>
          <div class="info-value">${totalQuestions} Questions</div>
        </div>
      </div>

      <div class="section-title">📋 Question Review</div>

      ${questions.map((q, index) => {
        const userAnswer = answers[q.id];
        const isCorrect = userAnswer === q.correctAnswer;
        const optionLabels = ['A', 'B', 'C', 'D'];

        return `
          <div class="question-item">
            <div class="question-header">
              <span class="question-number">Question ${index + 1}</span>
              <span class="question-status ${isCorrect ? 'correct' : 'incorrect'}">
                ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
              </span>
            </div>
            <div class="question-text">${q.question}</div>
            <ul class="options-list">
              ${q.options.map((option, oIndex) => {
                let optionClass = 'normal-option';
                if (oIndex === q.correctAnswer) {
                  optionClass = 'correct-answer';
                } else if (oIndex === userAnswer && userAnswer !== q.correctAnswer) {
                  optionClass = 'user-answer';
                }
                return `
                  <li class="option-item ${optionClass}">
                    <span class="option-marker">${optionLabels[oIndex]}</span>
                    ${option}
                  </li>
                `;
              }).join('')}
            </ul>
            ${!isCorrect ? `
              <div class="answer-note">
                <strong>Your answer:</strong> ${userAnswer !== undefined ? optionLabels[userAnswer] : 'Not answered'} | 
                <strong>Correct answer:</strong> ${optionLabels[q.correctAnswer]}
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}

      <div class="footer">
        <div class="footer-logo">📚 PDFStudy.online</div>
        <div class="footer-text">Your AI-Powered Learning Platform</div>
        <div class="footer-text">Generated on ${dateStr} at ${timeStr}</div>
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
