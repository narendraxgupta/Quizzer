import React from 'react';
import { Analytics, QuizStat } from '../types';

interface DashboardProps {
  analytics: Analytics;
  onClose: () => void;
  onClear: () => void;
  theme?: 'dark' | 'light';
}

const Dashboard: React.FC<DashboardProps> = ({ analytics, onClose, onClear, theme = 'dark' }) => {
  const quizzes = analytics.quizzes || [];
  const total = quizzes.length;
  const avgPercent = total === 0 ? 0 : Math.round((quizzes.reduce((s, q) => s + (q.score / q.totalQuestions) * 100, 0) / total));

  const byTopic: Record<string, { count: number; avg: number }> = {};
  quizzes.forEach((q) => {
    if (!byTopic[q.topic]) byTopic[q.topic] = { count: 0, avg: 0 };
    byTopic[q.topic].count += 1;
    byTopic[q.topic].avg += (q.score / q.totalQuestions) * 100;
  });

  Object.keys(byTopic).forEach(k => byTopic[k].avg = Math.round(byTopic[k].avg / byTopic[k].count));

  const isDark = theme === 'dark';

  const containerText = isDark ? 'text-white' : 'text-gray-900';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const panelBg = isDark ? 'bg-gray-700/40' : 'bg-gray-50';
  const subText = isDark ? 'text-gray-300' : 'text-gray-500';

  return (
    <div className={`min-h-screen p-6 flex flex-col items-center ${containerText}`}>
      <div className={`w-full max-w-4xl ${cardBg} rounded-lg shadow-lg p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <div className="flex gap-2">
            <button onClick={onClear} className={`px-3 py-1 rounded ${isDark ? 'bg-red-600 text-white' : 'bg-red-500 text-white'}`}>Clear stats</button>
            <button onClick={onClose} className={`px-3 py-1 rounded ${isDark ? 'bg-gray-600 text-white' : 'bg-gray-200'}`}>Close</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 ${panelBg} rounded`}>
            <div className={`text-sm ${subText}`}>Quizzes taken</div>
            <div className="text-3xl font-bold">{total}</div>
          </div>
          <div className={`p-4 ${panelBg} rounded`}>
            <div className={`text-sm ${subText}`}>Average score</div>
            <div className="text-3xl font-bold">{avgPercent}%</div>
          </div>
          <div className={`p-4 ${panelBg} rounded`}>
            <div className={`text-sm ${subText}`}>Unique topics</div>
            <div className="text-3xl font-bold">{Object.keys(byTopic).length}</div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Performance by topic</h3>
          <div className="space-y-2">
            {Object.keys(byTopic).length === 0 && <div className={`text-sm ${subText}`}>No data yet.</div>}
            {Object.entries(byTopic).map(([topic, data]) => (
              <div key={topic} className={`flex items-center justify-between ${panelBg} p-3 rounded`}>
                <div>
                  <div className="font-medium">{topic}</div>
                  <div className={`text-sm ${subText}`}>{data.count} quizzes</div>
                </div>
                <div className="text-lg font-semibold">{data.avg}%</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Recent quizzes</h3>
          <ol className="list-decimal pl-5 space-y-2">
            {quizzes.slice().reverse().map((q: QuizStat, idx) => (
              <li key={idx} className={`${panelBg} p-3 rounded`}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{q.topic} <span className={`text-sm ${subText}`}>({q.difficulty} • {q.language})</span></div>
                    <div className={`text-sm ${subText}`}>{new Date(q.date).toLocaleString()}</div>
                  </div>
                  <div className="font-semibold">{Math.round((q.score / q.totalQuestions) * 100)}%</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
