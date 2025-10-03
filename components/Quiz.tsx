
import React from 'react';
import { QuizQuestion, UserAnswers } from '../types';
import ProgressBar from './ProgressBar';
import QuestionCard from './QuestionCard';

interface QuizProps {
  questions: QuizQuestion[];
  userAnswers: UserAnswers;
  currentQuestionIndex: number;
  onAnswerSelect: (answer: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
  theme?: 'dark' | 'light';
  topic?: string;
  difficulty?: string;
}

const Quiz: React.FC<QuizProps> = ({
  questions,
  userAnswers,
  currentQuestionIndex,
  onAnswerSelect,
  onNext,
  onPrev,
  onFinish,
  theme = 'dark',
  topic = '',
  difficulty = 'Medium'
}) => {
  // Map difficulty to seconds per question
  const secondsForDifficulty = (d: string) => {
    switch (d) {
      case 'Easy': return 60;
      case 'Hard': return 20;
      default: return 40; // Medium
    }
  };

  const [remaining, setRemaining] = React.useState<number>(() => secondsForDifficulty(difficulty));

  React.useEffect(() => {
    // reset timer when question changes or difficulty changes
    setRemaining(secondsForDifficulty(difficulty));
    let interval: number | undefined;
    interval = window.setInterval(() => {
      setRemaining((r) => r - 1);
    }, 1000) as unknown as number;

    return () => {
      if (interval) clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, difficulty]);

  React.useEffect(() => {
    if (remaining <= 0) {
      // Time's up: auto-advance
      if (currentQuestionIndex === questions.length - 1) {
        onFinish();
      } else {
        onNext();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  const formatTime = (sec: number) => {
    const s = Math.max(0, sec);
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const maxSeconds = secondsForDifficulty(difficulty);
  const percentRemaining = Math.max(0, Math.round((remaining / maxSeconds) * 100));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 w-full max-w-2xl mx-auto">
      <div className="w-full">
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="text-xl font-bold gradient-title">
              Question {currentQuestionIndex + 1}
              <span className="text-base ml-2 text-gray-400">/{questions.length}</span>
            </p>
          </div>
          <div className="flex flex-col items-end w-40">
            <div className={`text-sm font-mono ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`} aria-live="polite">
              {formatTime(remaining)}
            </div>
            <div className="w-full h-2 bg-gray-300 rounded mt-2 overflow-hidden" aria-hidden>
              <div className="h-2 rounded time-fill" style={{ width: `${percentRemaining}%` }} />
            </div>
          </div>
        </div>
        <ProgressBar current={currentQuestionIndex + 1} total={questions.length} />
        <QuestionCard
          question={currentQuestion}
          selectedAnswer={userAnswers[currentQuestionIndex]}
          onAnswerSelect={onAnswerSelect}
          theme={theme}
          topic={topic}
        />
        <div className="flex justify-between mt-8 w-full">
          <button
            onClick={onPrev}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 bg-gray-700 rounded-md font-semibold hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Previous
          </button>
          
          {isLastQuestion ? (
            <button
              onClick={onFinish}
              className="px-8 py-2 rounded-md font-semibold transition-colors shadow-lg"
              style={{ backgroundColor: 'var(--accent)', color: '#fff', boxShadow: '0 10px 20px rgba(99,102,241,0.18)' }}
            >
              Finish Quiz
              <i className="fas fa-flag-checkered ml-2"></i>
            </button>
          ) : (
            <button
              onClick={onNext}
              className="px-8 py-2 rounded-md font-semibold transition-colors shadow-lg"
              style={{ backgroundColor: 'var(--accent)', color: '#fff', boxShadow: '0 10px 20px rgba(99,102,241,0.18)' }}
            >
              Next
              <i className="fas fa-arrow-right ml-2"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
