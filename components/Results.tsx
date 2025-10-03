
import React, { useState, useEffect } from 'react';
import { generateQuizFeedback } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface ResultsProps {
  score: number;
  totalQuestions: number;
  topic: string;
  questions?: any[];
  userAnswers?: (string | null)[];
  onRestart: () => void;
}

const Results: React.FC<ResultsProps> = ({ score, totalQuestions, topic, questions = [], userAnswers = [], onRestart }) => {
  const exportData = () => ({ topic, score, totalQuestions, questions, userAnswers });

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.replace(/\s+/g, '_')}_quiz_results.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };
  const [feedback, setFeedback] = useState<string>('');
  const [isLoadingFeedback, setIsLoadingFeedback] = useState<boolean>(true);

  const percentage = Math.round((score / totalQuestions) * 100);

  useEffect(() => {
    const fetchFeedback = async () => {
      setIsLoadingFeedback(true);
      const generatedFeedback = await generateQuizFeedback(topic, score, totalQuestions);
      setFeedback(generatedFeedback);
      setIsLoadingFeedback(false);
    };

    fetchFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, totalQuestions, topic]);

  const getScoreColor = () => {
    if (percentage > 80) return 'text-green-400';
    if (percentage > 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl text-center w-full max-w-2xl">
        <h2 className="text-4xl font-bold mb-4 gradient-title">
          Quiz Complete!
        </h2>
        <p className="text-xl text-gray-300 mb-6">You completed the <span className="font-semibold" style={{ color: 'var(--accent)' }}>{topic}</span> quiz.</p>

    <div className="my-8">
      <p className="text-lg text-gray-400">Your Score</p>
      <p className={`text-7xl font-bold my-2 ${getScoreColor()}`}>{percentage}%</p>
      <p className="text-lg text-gray-300">You answered <span className="font-bold">{score}</span> out of <span className="font-bold">{totalQuestions}</span> questions correctly.</p>
    </div>

        <div className="bg-gray-700/50 p-6 rounded-lg min-h-[120px] flex items-center justify-center">
          {isLoadingFeedback ? (
            <LoadingSpinner text="Generating personalized feedback..." />
          ) : (
            <div>
                <p className="text-lg font-semibold mb-2" style={{ color: 'var(--accent)' }}>AI Feedback:</p>
                <p className="text-gray-300 italic">"{feedback}"</p>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex gap-3 w-full">
          <button
            onClick={handleExportJSON}
            className="flex-1 px-4 py-3 rounded-lg font-semibold transition-colors"
            style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          >
            <i className="fas fa-file-export mr-2"></i>
            Export JSON
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-3 rounded-lg font-semibold transition-colors"
            style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          >
            <i className="fas fa-print mr-2"></i>
            Print / Save as PDF
          </button>
        </div>

        <button
          onClick={onRestart}
          className="mt-6 w-full px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-300 shadow-lg"
          style={{ backgroundColor: 'var(--accent)', color: '#fff', boxShadow: '0 10px 20px rgba(99,102,241,0.18)' }}
        >
           <i className="fas fa-redo mr-2"></i>
           Try Another Quiz
        </button>

        <div className="mt-8 bg-gray-800/30 p-6 rounded-lg text-left">
          <h3 className="text-2xl font-semibold mb-4">Review</h3>
          <ol className="list-decimal pl-5 space-y-4">
            {questions.map((q, idx) => (
              <li key={idx}>
                <p className="font-semibold">{q.question}</p>
                <p className="text-sm text-gray-300">Your answer: <span className="font-medium">{userAnswers[idx] ?? 'No answer'}</span></p>
                <p className="text-sm text-gray-300">Correct answer: <span className="font-medium">{q.correctAnswer}</span></p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Results;
