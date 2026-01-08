export type TestCategory = 
  | 'math'
  | 'science'
  | 'history'
  | 'english'
  | 'geography'
  | 'languages'
  | 'computer_science'
  | 'arts'
  | 'music'
  | 'sports'
  | 'other';

export const CATEGORY_LABELS: Record<TestCategory, string> = {
  math: 'Math',
  science: 'Science',
  history: 'History',
  english: 'English',
  geography: 'Geography',
  languages: 'Languages',
  computer_science: 'Computer Science',
  arts: 'Arts',
  music: 'Music',
  sports: 'Sports',
  other: 'Other',
};

export const CATEGORY_COLORS: Record<TestCategory, string> = {
  math: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  science: 'bg-green-500/10 text-green-600 dark:text-green-400',
  history: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  english: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  geography: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  languages: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  computer_science: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  arts: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  music: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  sports: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  other: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
};

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Test {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  questions: Question[];
  category: TestCategory;
  created_at: string;
  updated_at: string;
}

export interface TestWithProfile extends Test {
  profile: {
    full_name: string;
    avatar_url: string | null;
  } | null;
  averageRating: number;
  totalRatings: number;
  isSaved: boolean;
  // AI-related fields
  class_standard?: number | null;
  subject?: string | null;
  topic?: string | null;
  difficulty?: string | null;
  is_ai_generated?: boolean;
}

export interface Rating {
  id: string;
  user_id: string;
  test_id: string;
  rating: number;
  feedback: string | null;
  created_at: string;
}

export interface TestAttempt {
  id: string;
  user_id: string;
  test_id: string;
  score: number;
  total_questions: number;
  answers: Record<string, number>;
  completed_at: string;
}
