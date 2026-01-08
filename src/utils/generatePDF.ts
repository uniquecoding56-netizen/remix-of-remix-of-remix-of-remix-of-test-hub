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

  // Generate HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title} - Test Results</title>
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
          font-size: 24px;
          font-weight: bold;
          color: #6366f1;
          margin-bottom: 10px;
        }
        .title {
          font-size: 22px;
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
          padding: 25px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 30px;
        }
        .score-value {
          font-size: 48px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .score-label {
          font-size: 16px;
          opacity: 0.9;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }
        .info-item {
          background: #f9fafb;
          padding: 12px 15px;
          border-radius: 8px;
          border-left: 3px solid #6366f1;
        }
        .info-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
        }
        .info-value {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        .question-item {
          margin-bottom: 25px;
          padding: 15px;
          background: #f9fafb;
          border-radius: 8px;
        }
        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }
        .question-number {
          font-weight: 600;
          color: #6366f1;
        }
        .question-status {
          font-size: 12px;
          padding: 3px 10px;
          border-radius: 12px;
          font-weight: 500;
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
          font-size: 15px;
          margin-bottom: 12px;
          color: #1f2937;
        }
        .options-list {
          list-style: none;
          margin-bottom: 10px;
        }
        .option-item {
          padding: 8px 12px;
          margin-bottom: 5px;
          border-radius: 6px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .option-marker {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .user-answer {
          background: #fef3c7;
          border: 1px solid #f59e0b;
        }
        .correct-answer {
          background: #d1fae5;
          border: 1px solid #10b981;
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
          font-size: 12px;
          color: #6b7280;
          margin-top: 8px;
          font-style: italic;
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
          .question-item {
            break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">📚 StudyHub</div>
        <div class="title">${title}</div>
        ${description ? `<div class="subtitle">${description}</div>` : ''}
      </div>

      <div class="score-card">
        <div class="score-value">${score}/${totalQuestions}</div>
        <div class="score-label">${percentage}% Score</div>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Student</div>
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
          <div class="info-value">${totalQuestions}</div>
        </div>
      </div>

      <div class="section-title">Question Review</div>

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
                Your answer: ${userAnswer !== undefined ? optionLabels[userAnswer] : 'Not answered'} | 
                Correct answer: ${optionLabels[q.correctAnswer]}
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}

      <div class="footer">
        Generated by StudyHub • ${dateStr} at ${timeStr}
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
