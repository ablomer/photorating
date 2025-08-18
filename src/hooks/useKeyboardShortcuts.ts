import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
  onRate: (rating: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onDeleteLast: () => void;
  isEnabled: boolean;
}

export const useKeyboardShortcuts = ({ 
  onRate, 
  onPrevious, 
  onNext, 
  onDeleteLast,
  isEnabled 
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }

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
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onRate, onPrevious, onNext, onDeleteLast, isEnabled]);
};
