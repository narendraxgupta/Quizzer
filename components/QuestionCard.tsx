
import React, { useEffect, useState } from 'react';
import { QuizQuestion } from '../types';
import { generateQuestionExplanation, generateQuestionHint } from '../services/geminiService';

interface QuestionCardProps {
  question: QuizQuestion;
  selectedAnswer: string | null;
  onAnswerSelect: (answer: string) => void;
  theme?: 'dark' | 'light';
  topic?: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, selectedAnswer, onAnswerSelect, theme = 'dark', topic = '' }) => {
  const containerClass = theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900';
  const optionUnselected = theme === 'dark' ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-white' : 'bg-gray-100 border-gray-200 text-gray-900';
  const optionSelected = theme === 'dark' ? 'text-white font-semibold shadow-lg' : 'text-white font-semibold shadow-md';
  const [hint, setHint] = useState<string>('');
  const [hintLoading, setHintLoading] = useState<boolean>(false);

  const requestHint = async () => {
    if (hint) return; // already fetched
    try {
      setHintLoading(true);
      const h = await generateQuestionHint(topic, question.question);
      setHint(h);
    } catch (e) {
      setHint('Unable to fetch hint.');
    } finally {
      setHintLoading(false);
    }
  };

  return (
    <div className={`${containerClass} p-8 rounded-lg shadow-2xl w-full`}>
      <h2 className="text-2xl font-semibold mb-6">{question.question}</h2>
      <div className="space-y-4">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const baseClasses = "w-full text-left p-4 rounded-lg border-2 transition-colors duration-200 text-lg";
          return (
            <button
              key={index}
              onClick={() => onAnswerSelect(option)}
              className={`${baseClasses} ${isSelected ? optionSelected : optionUnselected}`}
              style={isSelected ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' } : undefined}
            >
              {option}
            </button>
          );
        })}
      </div>
      {selectedAnswer && (
        <Explanation topic={topic} question={question} selectedAnswer={selectedAnswer} />
      )}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={requestHint}
          disabled={!!hintLoading}
          className={`px-3 py-2 rounded-md text-sm ${theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
        >
          {hintLoading ? 'Loading hint...' : 'Hint'}
        </button>
  {hint && <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{hint}</p>}
      </div>
    </div>
  );
};

const Explanation: React.FC<{ topic?: string; question: QuizQuestion; selectedAnswer: string }> = ({ topic = '', question, selectedAnswer }) => {
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      const exp = await generateQuestionExplanation(topic, question.question, question.correctAnswer);
      if (mounted) {
        setExplanation(exp);
        setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, [topic, question]);

  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <div className={`mt-6 p-4 rounded-md ${isCorrect ? 'bg-green-700/20 border-green-500' : 'bg-red-700/10 border-red-500'}`}>
      <p className="font-semibold mb-2">{isCorrect ? 'Correct' : 'Explanation'}</p>
      {loading ? <p className="text-sm text-gray-300">Loading explanation...</p> : <p className="text-sm">{explanation}</p>}
    </div>
  );
};

export default QuestionCard;
