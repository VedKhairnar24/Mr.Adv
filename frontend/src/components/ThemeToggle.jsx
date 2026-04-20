import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {theme === 'dark' ? (
        // Sun icon for dark mode (click to switch to light)
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v6M12 17v6M23 12h-6M1 12h6M20.5 3.5l-4.2 4.2M7.7 16.3l-4.2 4.2M20.5 20.5l-4.2-4.2M7.7 7.7l-4.2-4.2" />
        </svg>
      ) : (
        // Moon icon for light mode (click to switch to dark)
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
