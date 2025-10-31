import React from 'react';
import type { AppMode } from '../types';

interface ModeSelectorProps {
  onModeSelect: (mode: AppMode) => void;
  isLoading: boolean;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ onModeSelect, isLoading }) => {
  return (
    <div className="mode-selector" role="region" aria-label="Mode selection">
      <h3 id="mode-selector-title">Choose Evaluation Mode</h3>
      <p aria-describedby="mode-selector-title">Select how you'd like to evaluate your images:</p>
      
      <div className="mode-options" role="group" aria-labelledby="mode-selector-title">
        <button
          onClick={() => onModeSelect('rating')}
          disabled={isLoading}
          className="mode-button rating-mode"
          type="button"
          aria-describedby="rating-mode-description"
        >
          <div className="mode-icon" aria-hidden="true">⭐</div>
          <div className="mode-content">
            <h4>Rating Mode</h4>
            <div id="rating-mode-description">
              <p>Rate each image with 1-5 stars</p>
              <p className="mode-detail">Perfect for absolute scoring</p>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => onModeSelect('ranking')}
          disabled={isLoading}
          className="mode-button ranking-mode"
          type="button"
          aria-describedby="ranking-mode-description"
        >
          <div className="mode-icon" aria-hidden="true">🏆</div>
          <div className="mode-content">
            <h4>Ranking Mode</h4>
            <div id="ranking-mode-description">
              <p>Compare images pairwise to create a ranking</p>
              <p className="mode-detail">Perfect for relative comparison</p>
            </div>
          </div>
        </button>
      </div>
      
      {isLoading && (
        <div className="sr-only" role="status" aria-live="polite">
          Loading mode selection...
        </div>
      )}
    </div>
  );
};

export default ModeSelector;