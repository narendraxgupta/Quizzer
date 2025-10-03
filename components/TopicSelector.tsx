import React, { useState } from 'react';
import { Difficulty } from '../types';

const topics = [
  { name: 'Wellness', icon: 'fa-spa', desc: 'Health, habits and wellbeing' },
  { name: 'Tech Trends', icon: 'fa-microchip', desc: 'Latest in AI, cloud, and dev' },
  { name: 'World History', icon: 'fa-landmark', desc: 'Events and people who shaped history' },
  { name: 'Space Exploration', icon: 'fa-rocket', desc: 'Rockets, missions and astronomy' },
  { name: 'Ocean Life', icon: 'fa-water', desc: 'Marine animals and ecosystems' },
  { name: 'Modern Art', icon: 'fa-palette', desc: 'Movements and artists of modern art' },
];

interface TopicSelectorProps {
  onSelectTopic: (topic: string, difficulty: Difficulty, language: string) => void;
  theme?: 'dark' | 'light';
  currentLanguage?: string;
  onChangeLanguage?: (lang: string) => void;
}

const TopicCard: React.FC<{ name: string; icon: string; desc?: string; onClick: () => void; theme?: 'dark' | 'light' }> = ({ name, icon, desc, onClick, theme = 'dark' }) => {
  // base styles tuned for consistent sizing and responsive look
  const bg = theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900';
  const hover = theme === 'dark' ? 'hover:shadow-indigo-500/50 hover:bg-gray-700' : 'hover:shadow-indigo-200 hover:bg-gray-50';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Start ${name} quiz`}
      className={`${bg} ${hover} rounded-lg p-6 flex flex-col justify-between text-left transform hover:-translate-y-1 transition-all duration-200 shadow-sm min-h-[160px] w-full`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-indigo-50'}`}>
          <i className={`fas ${icon} text-xl ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'}`}></i>
        </div>
        <div>
          <div className="font-semibold text-lg">{name}</div>
          {desc && <div className="text-sm mt-1 text-gray-400">{desc}</div>}
        </div>
      </div>
      <div className="mt-4 text-right">
        <span className="text-sm" style={{ color: 'var(--accent)' }}>Take Quiz →</span>
      </div>
    </button>
  );
};

const TopicSelector: React.FC<TopicSelectorProps> = ({ onSelectTopic, theme = 'dark', currentLanguage = 'English', onChangeLanguage }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [customTopic, setCustomTopic] = useState<string>('');

  const submitCustomTopic = () => {
    const t = customTopic.trim();
    if (t.length === 0) return;
    onSelectTopic(t, difficulty, currentLanguage || 'English');
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-5xl font-bold mb-4 gradient-title">
        AI Knowledge Quiz
      </h1>
      <p className="text-xl text-gray-400 mb-12">Choose a topic to begin your challenge!</p>
  <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-center items-center gap-6 sm:gap-4 w-full">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <span className={`${theme === 'dark' ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}`}>Difficulty:</span>
        <div className="inline-flex rounded-md shadow-sm" role="group">
          {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-3 py-1 text-sm font-medium rounded-md ${difficulty === d ? 'text-white' : (theme === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}`}
              style={difficulty === d ? { backgroundColor: 'var(--accent)' } : undefined}
            >
              {d}
            </button>
          ))}
        </div>
        </div>

  <div className="flex items-center gap-2 w-full sm:w-1/2 justify-center">
          <label htmlFor="language" className="sr-only">Language</label>
          <select
            id="language"
            value={currentLanguage}
            onChange={(e) => onChangeLanguage && onChangeLanguage(e.target.value)}
            className={`px-3 py-2 rounded-md border ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            {([
              'English', 'Spanish', 'French', 'German', 'Hindi', 'Chinese', 'Japanese', 'Portuguese', 'Russian', 'Arabic', 'Italian', 'Korean', 'Dutch', 'Turkish'
            ] as string[]).map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          
          <label htmlFor="custom-topic" className="sr-only">Custom topic</label>
          <input
            id="custom-topic"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submitCustomTopic(); }}
            placeholder="Or type a custom topic (e.g. 'Cryptography')"
            className={`flex-1 px-3 py-2 rounded-md border ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
          />
          <button
            onClick={submitCustomTopic}
            className={`px-4 py-2 rounded-md font-medium text-white`}
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Start
          </button>
        </div>
      </div>

      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <TopicCard key={topic.name} {...topic} onClick={() => onSelectTopic(topic.name, difficulty, currentLanguage || 'English')} theme={theme} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopicSelector;
