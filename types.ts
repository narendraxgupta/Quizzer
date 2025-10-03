
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizData {
  questions: QuizQuestion[];
}

export type UserAnswers = (string | null)[];

export enum AppState {
  SELECTING_TOPIC,
  LOADING_QUIZ,
  IN_QUIZ,
  DASHBOARD,
  SHOWING_RESULTS,
  ERROR,
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Language =
  | 'English'
  | 'Spanish'
  | 'French'
  | 'German'
  | 'Hindi'
  | 'Chinese'
  | 'Japanese'
  | 'Portuguese'
  | 'Russian'
  | 'Arabic'
  | 'Italian'
  | 'Korean'
  | 'Dutch'
  | 'Turkish';

export interface QuizStat {
  topic: string;
  score: number;
  totalQuestions: number;
  date: string; // ISO
  difficulty: Difficulty;
  language: Language;
}

export interface Analytics {
  quizzes: QuizStat[];
}
