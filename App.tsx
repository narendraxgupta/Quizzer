
import React, { useState, useCallback, useEffect } from 'react';
import TopicSelector from './components/TopicSelector';
import Quiz from './components/Quiz';
import Results from './components/Results';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import Footer from './components/Footer';
import { AppState, QuizQuestion, UserAnswers, Analytics } from './types';
import { generateQuizQuestions } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SELECTING_TOPIC);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [currentDifficulty, setCurrentDifficulty] = useState<string>('Medium');
  const [currentLanguage, setCurrentLanguage] = useState<string>('English');
  const [score, setScore] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<Analytics>(() => {
    try {
      const saved = localStorage.getItem('analytics');
      return saved ? JSON.parse(saved) : { quizzes: [] };
    } catch { return { quizzes: [] }; }
  });
  const [showDashboard, setShowDashboard] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('theme');
      return (saved === 'light' || saved === 'dark') ? (saved as 'light' | 'dark') : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  // Accent/theme color selection (affects --accent CSS variable)
  const colorOptions: Record<string, { primary: string; secondary: string }> = {
    Indigo: { primary: '#6366f1', secondary: '#a78bfa' },
    Teal: { primary: '#14b8a6', secondary: '#7dd3bd' },
    Emerald: { primary: '#10b981', secondary: '#6ee7b7' },
    Amber: { primary: '#f59e0b', secondary: '#fed7aa' },
    Rose: { primary: '#f43f5e', secondary: '#ff7a9e' },
    Violet: { primary: '#7c3aed', secondary: '#c084fc' },
    Cyan: { primary: '#06b6d4', secondary: '#7dd3fc' },
    Orange: { primary: '#fb923c', secondary: '#ffbf80' },
    Pink: { primary: '#ec4899', secondary: '#f9a8d4' }
  };
  const [accentColorKey, setAccentColorKey] = useState<string>(() => {
    try { return localStorage.getItem('accentColorKey') || 'Indigo'; } catch { return 'Indigo'; }
  });

  useEffect(() => {
    try {
      localStorage.setItem('accentColorKey', accentColorKey);
    } catch {}
    const pair = colorOptions[accentColorKey] || colorOptions['Indigo'];
    try {
      document.documentElement.style.setProperty('--accent', pair.primary);
      document.documentElement.style.setProperty('--accent-2', pair.secondary);
    } catch {}
  }, [accentColorKey]);
  

  // Persist and restore quiz progress
  useEffect(() => {
    try {
      const saved = localStorage.getItem('quiz_progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Basic validation
        if (parsed && parsed.appState && parsed.currentTopic) {
          setAppState(parsed.appState);
          setQuestions(parsed.questions || []);
          setUserAnswers(parsed.userAnswers || []);
          setCurrentQuestionIndex(parsed.currentQuestionIndex || 0);
          setCurrentTopic(parsed.currentTopic || '');
          setCurrentDifficulty(parsed.currentDifficulty || 'Medium');
          setCurrentLanguage(parsed.currentLanguage || 'English');
          setScore(parsed.score || 0);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const toSave = {
        appState,
        questions,
        userAnswers,
        currentQuestionIndex,
        currentTopic,
        currentDifficulty,
        currentLanguage,
        score,
      };
      localStorage.setItem('quiz_progress', JSON.stringify(toSave));
      try { localStorage.setItem('analytics', JSON.stringify(analytics)); } catch {}
    } catch {}
  }, [appState, questions, userAnswers, currentQuestionIndex, currentTopic, currentDifficulty, score]);

  const handleSelectTopic = useCallback(async (topic: string, difficulty: string, language: string) => {
    setCurrentTopic(topic);
    setCurrentDifficulty(difficulty);
    setCurrentLanguage(language);
    setAppState(AppState.LOADING_QUIZ);
    setError(null);
    try {
      const quizData = await generateQuizQuestions(topic, difficulty as any, language as any);
      if (quizData.questions && quizData.questions.length > 0) {
        // Shuffle options for each question to avoid predictable ordering
        const shuffled = quizData.questions.map((q) => {
          const options = [...q.options];
          for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
          }
          return { ...q, options };
        });
        setQuestions(shuffled);
        setUserAnswers(new Array(quizData.questions.length).fill(null));
        setCurrentQuestionIndex(0);
        setAppState(AppState.IN_QUIZ);
      } else {
        throw new Error("The AI failed to generate any questions for this topic.");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while fetching the quiz.");
      setAppState(AppState.ERROR);
    }
  }, []);

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinishQuiz = () => {
    let finalScore = 0;
    for (let i = 0; i < questions.length; i++) {
      if (userAnswers[i] === questions[i].correctAnswer) {
        finalScore++;
      }
    }
    setScore(finalScore);
    // record stat
    try {
      const stat = {
        topic: currentTopic,
        score: finalScore,
        totalQuestions: questions.length,
        date: new Date().toISOString(),
        difficulty: currentDifficulty as any,
        language: currentLanguage as any,
      };
      const next = { quizzes: [...(analytics.quizzes || []), stat] };
      setAnalytics(next);
      try { localStorage.setItem('analytics', JSON.stringify(next)); } catch {}
    } catch {}

    setAppState(AppState.SHOWING_RESULTS);
  };

  const handleRestart = () => {
    setAppState(AppState.SELECTING_TOPIC);
    setQuestions([]);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setCurrentTopic('');
    setScore(0);
    setError(null);
    try { localStorage.removeItem('quiz_progress'); } catch {}
  };

  const clearProgress = () => {
    try { localStorage.removeItem('quiz_progress'); } catch {}
    // Keep UI state but clear saved progress
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.SELECTING_TOPIC:
        return <TopicSelector onSelectTopic={handleSelectTopic} theme={theme} currentLanguage={currentLanguage} onChangeLanguage={(l) => setCurrentLanguage(l as any)} />;
      case AppState.LOADING_QUIZ:
        return (
          <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner text={`Generating your ${currentTopic} quiz...`} />
          </div>
        );
      case AppState.IN_QUIZ:
        return (
          <Quiz
            questions={questions}
            userAnswers={userAnswers}
            currentQuestionIndex={currentQuestionIndex}
            onAnswerSelect={handleAnswerSelect}
            onNext={handleNextQuestion}
            onPrev={handlePrevQuestion}
            onFinish={handleFinishQuiz}
            theme={theme}
            topic={currentTopic}
            difficulty={currentDifficulty}
          />
        );
      case AppState.SHOWING_RESULTS:
        return (
          <Results
            score={score}
            totalQuestions={questions.length}
            topic={currentTopic}
            questions={questions}
            userAnswers={userAnswers}
            onRestart={handleRestart}
            // include language if needed later
            // language={currentLanguage}
          />
        );
      case AppState.ERROR:
        return <ErrorDisplay message={error || "Something went wrong."} onRetry={handleRestart} />;
      default:
        return <TopicSelector onSelectTopic={handleSelectTopic} />;
    }
  };

  const topLevelClass = theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900';

  return (
    <main className={`${topLevelClass} font-sans min-h-screen`}>
  <div className="max-w-6xl mx-auto p-4">
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleRestart}
              aria-label="Go to home"
              className={`px-3 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              <i className="fas fa-home mr-2"></i>
              Home
            </button>
            <button
              onClick={clearProgress}
              aria-label="Clear saved progress"
              className={`px-3 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              <i className="fas fa-trash-alt mr-2"></i>
              Clear Progress
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDashboard(true)}
              aria-label="Open analytics dashboard"
              className={`px-3 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              <i className="fas fa-chart-line mr-2"></i>
              Dashboard
            </button>
            <label htmlFor="accent" className="sr-only">Accent</label>
            <select
              id="accent"
              value={accentColorKey}
              onChange={(e) => setAccentColorKey(e.target.value)}
              className={`px-2 py-1 rounded-md border ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              {Object.keys(colorOptions).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <button
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`px-3 py-2 rounded-md ${theme === 'dark' ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              {theme === 'dark' ? (
                <span><i className="fas fa-sun mr-2"></i>Light</span>
              ) : (
                <span><i className="fas fa-moon mr-2"></i>Dark</span>
              )}
            </button>
          </div>
        </header>

        {showDashboard ? (
          <Dashboard analytics={analytics} theme={theme} onClose={() => setShowDashboard(false)} onClear={() => { setAnalytics({ quizzes: [] }); localStorage.removeItem('analytics'); }} />
        ) : (
          <>
            {renderContent()}
          </>
        )}
      </div>
      <Footer theme={theme} />
    </main>
  );
};

export default App;
