import React from 'react';

const Footer: React.FC<{ theme?: 'dark' | 'light' }> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const bg = isDark ? 'bg-gray-900' : 'bg-white';
  const text = isDark ? 'text-gray-400' : 'text-gray-700';
  const border = isDark ? 'border-t border-gray-800' : 'border-t border-gray-200';

  const year = new Date().getFullYear();

  return (
    <footer role="contentinfo" className={`${bg} ${border} mt-12 p-4`}>
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className={`text-sm ${text}`}>
          <span>Made with <span aria-hidden>❤️</span> — </span>
          <a href="#" style={{ color: 'var(--accent)' }} className="font-medium"> By Narendra Gupta</a>
          <span className="ml-2 text-xs" style={{ color: 'var(--muted, rgba(255,255,255,0.6))' }}>© {year}</span>
        </div>

        <div className="text-sm">
          <a className={`mr-4 ${text}`} href="#">Privacy</a>
          <a className={`mr-4 ${text}`} href="#">Terms</a>
          <a
            className={text}
            href="https://github.com/narendraxgupta"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open GitHub profile in new tab"
            style={{ color: 'var(--accent)' }}
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
