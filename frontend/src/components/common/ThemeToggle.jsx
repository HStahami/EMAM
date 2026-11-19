import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle({ style = {}, className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      aria-label="Toggle theme"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        background: isLight ? 'rgba(105, 14, 31, 0.08)' : 'rgba(241, 163, 42, 0.12)',
        border: `1px solid ${isLight ? 'rgba(105, 14, 31, 0.22)' : 'rgba(241, 163, 42, 0.3)'}`,
        color: isLight ? '#690e1f' : 'var(--color-primary)',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        flexShrink: 0,
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.08)';
        e.currentTarget.style.borderColor = isLight ? '#690e1f' : 'var(--color-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.borderColor = isLight ? 'rgba(105, 14, 31, 0.22)' : 'rgba(241, 163, 42, 0.3)';
      }}
    >
      {isLight ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
