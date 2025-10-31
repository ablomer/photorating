import React, { useCallback, useState, useRef } from 'react';
import type { ImageData } from '../types';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface ComparisonViewProps {
  leftImage: ImageData;
  rightImage: ImageData;
  onChoice: (winner: 'left' | 'right') => void;
  comparisonNumber: number;
  totalComparisons: number;
  progress: number; // 0-100
}

const ComparisonView: React.FC<ComparisonViewProps> = ({
  leftImage,
  rightImage,
  onChoice,
  comparisonNumber,
  totalComparisons,
  progress
}) => {
  const [selectedChoice, setSelectedChoice] = useState<'left' | 'right' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const leftButtonRef = useRef<HTMLButtonElement>(null);
  const rightButtonRef = useRef<HTMLButtonElement>(null);

  const handleLeftChoice = useCallback(() => {
    if (isProcessing) return;
    
    setSelectedChoice('left');
    setIsProcessing(true);
    
    // Add a brief delay to show visual feedback before proceeding
    // Shorter delay on touch devices for better responsiveness
    const delay = 'ontouchstart' in window ? 300 : 500;
    setTimeout(() => {
      onChoice('left');
      setSelectedChoice(null);
      setIsProcessing(false);
    }, delay);
  }, [onChoice, isProcessing]);

  const handleRightChoice = useCallback(() => {
    if (isProcessing) return;
    
    setSelectedChoice('right');
    setIsProcessing(true);
    
    // Add a brief delay to show visual feedback before proceeding
    // Shorter delay on touch devices for better responsiveness
    const delay = 'ontouchstart' in window ? 300 : 500;
    setTimeout(() => {
      onChoice('right');
      setSelectedChoice(null);
      setIsProcessing(false);
    }, delay);
  }, [onChoice, isProcessing]);

  // Handle keyboard choice from centralized hook
  const handleKeyboardChoice = useCallback((choice: 'left' | 'right') => {
    if (choice === 'left') {
      handleLeftChoice();
    } else {
      handleRightChoice();
    }
  }, [handleLeftChoice, handleRightChoice]);

  // Use centralized keyboard shortcuts hook for ranking mode
  useKeyboardShortcuts({
    onRate: () => {}, // Not used in ranking mode
    onPrevious: () => {}, // Not used in ranking mode
    onNext: () => {}, // Not used in ranking mode
    onDeleteLast: () => {}, // Not used in ranking mode
    isEnabled: !isProcessing, // Disable shortcuts while processing
    onRankingChoice: handleKeyboardChoice,
    mode: 'ranking'
  });

  return (
    <div className="comparison-view" role="main" aria-label="Image comparison interface">
      {/* Progress Header */}
      <div className="comparison-header">
        <div className="comparison-info">
          <h2 id="comparison-title">Comparison {comparisonNumber} of {totalComparisons}</h2>
          <p id="comparison-instructions">Choose the better image using arrow keys or clicking</p>
        </div>
        <div className="progress-container">
          <div 
            className="progress-bar" 
            role="progressbar" 
            aria-valuenow={Math.round(progress)} 
            aria-valuemin={0} 
            aria-valuemax={100}
            aria-label={`Ranking progress: ${Math.round(progress)}% complete`}
          >
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-text" aria-hidden="true">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Comparison Images */}
      <div 
        className="comparison-images" 
        role="group" 
        aria-labelledby="comparison-title"
        aria-describedby="comparison-instructions"
      >
        <button
          ref={leftButtonRef}
          className={`comparison-image-button left-image ${
            selectedChoice === 'left' ? 'selected' : ''
          } ${selectedChoice === 'right' ? 'not-selected' : ''}`}
          onClick={handleLeftChoice}
          disabled={isProcessing}
          aria-label={`Choose left image: ${leftImage.path.split('/').pop()}. Press left arrow key or click to select.`}
          aria-describedby={selectedChoice === 'left' ? 'left-selected-feedback' : undefined}
          onTouchStart={(e) => {
            // Prevent default to avoid double-tap zoom
            e.preventDefault();
          }}
        >
          <img
            src={leftImage.url}
            alt={`Image for comparison: ${leftImage.path.split('/').pop()}`}
            className="comparison-image"
          />
          <div className="image-overlay" aria-hidden="true">
            <div className="choice-indicator">
              {selectedChoice === 'left' ? (
                <>
                  <span className="choice-feedback selected">✓</span>
                  <span className="choice-text">Selected!</span>
                </>
              ) : (
                <>
                  <span className="arrow-key">←</span>
                  <span className="choice-text">Choose</span>
                </>
              )}
            </div>
          </div>
          <div className="image-info">
            <span className="image-name">{leftImage.path.split('/').pop()}</span>
          </div>
          {selectedChoice === 'left' && (
            <div id="left-selected-feedback" className="sr-only">
              Left image selected. Processing your choice.
            </div>
          )}
        </button>

        <div className="comparison-divider" aria-hidden="true">
          <span className="vs-text">VS</span>
        </div>

        <button
          ref={rightButtonRef}
          className={`comparison-image-button right-image ${
            selectedChoice === 'right' ? 'selected' : ''
          } ${selectedChoice === 'left' ? 'not-selected' : ''}`}
          onClick={handleRightChoice}
          disabled={isProcessing}
          aria-label={`Choose right image: ${rightImage.path.split('/').pop()}. Press right arrow key or click to select.`}
          aria-describedby={selectedChoice === 'right' ? 'right-selected-feedback' : undefined}
          onTouchStart={(e) => {
            // Prevent default to avoid double-tap zoom
            e.preventDefault();
          }}
        >
          <img
            src={rightImage.url}
            alt={`Image for comparison: ${rightImage.path.split('/').pop()}`}
            className="comparison-image"
          />
          <div className="image-overlay" aria-hidden="true">
            <div className="choice-indicator">
              {selectedChoice === 'right' ? (
                <>
                  <span className="choice-feedback selected">✓</span>
                  <span className="choice-text">Selected!</span>
                </>
              ) : (
                <>
                  <span className="arrow-key">→</span>
                  <span className="choice-text">Choose</span>
                </>
              )}
            </div>
          </div>
          <div className="image-info">
            <span className="image-name">{rightImage.path.split('/').pop()}</span>
          </div>
          {selectedChoice === 'right' && (
            <div id="right-selected-feedback" className="sr-only">
              Right image selected. Processing your choice.
            </div>
          )}
        </button>
      </div>

      {/* Keyboard Hint */}
      <div className="keyboard-hint" role="complementary" aria-label="Keyboard shortcuts">
        <p>Use ← → arrow keys or click to choose</p>
      </div>

      {/* Live region for screen reader announcements */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        id="comparison-status"
      >
        {isProcessing && selectedChoice && (
          `${selectedChoice === 'left' ? 'Left' : 'Right'} image selected. Moving to next comparison.`
        )}
      </div>
    </div>
  );
};

export default ComparisonView;