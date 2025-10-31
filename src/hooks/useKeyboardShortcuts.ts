import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
  onRate: (rating: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onDeleteLast: () => void;
  isEnabled: boolean;
  // Ranking mode specific handlers
  onRankingChoice?: (choice: 'left' | 'right') => void;
  mode?: 'rating' | 'ranking';
}

export const useKeyboardShortcuts = ({ 
  onRate, 
  onPrevious, 
  onNext, 
  onDeleteLast,
  isEnabled,
  onRankingChoice,
  mode = 'rating'
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (mode === 'ranking') {
        // Ranking mode keyboard shortcuts
        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            onRankingChoice?.('left');
            break;
          case 'ArrowRight':
            event.preventDefault();
            onRankingChoice?.('right');
            break;
        }
      } else {
        // Rating mode keyboard shortcuts (existing functionality)
        switch (event.key) {
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
            event.preventDefault();
            onRate(parseInt(event.key));
            break;
          case 'ArrowLeft':
            event.preventDefault();
            onPrevious();
            break;
          case 'ArrowRight':
            event.preventDefault();
            onNext();
            break;
          case 'Delete':
          case 'Backspace':
            event.preventDefault();
            onDeleteLast();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onRate, onPrevious, onNext, onDeleteLast, isEnabled, onRankingChoice, mode]);
};
