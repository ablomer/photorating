import React, { useState, useEffect, useCallback } from 'react';
import type { RankingResult } from '../types';

interface RankingResultsProps {
  rankings: RankingResult[];
  onImageSelect: (imageIndex: number) => void;
  selectedImageIndex: number;
  onDownload: () => void;
  onStartNew: () => void;
}

const RankingResults: React.FC<RankingResultsProps> = ({
  rankings,
  onImageSelect,
  selectedImageIndex,
  onDownload,
  onStartNew
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload();
    } finally {
      setIsDownloading(false);
    }
  };

  // Navigation functions
  const goToPrevious = useCallback(() => {
    if (selectedImageIndex > 0) {
      onImageSelect(selectedImageIndex - 1);
    }
  }, [selectedImageIndex, onImageSelect]);

  const goToNext = useCallback(() => {
    if (selectedImageIndex < rankings.length - 1) {
      onImageSelect(selectedImageIndex + 1);
    }
  }, [selectedImageIndex, rankings.length, onImageSelect]);

  const goToFirst = useCallback(() => {
    onImageSelect(0);
  }, [onImageSelect]);

  const goToLast = useCallback(() => {
    onImageSelect(rankings.length - 1);
  }, [rankings.length, onImageSelect]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNext();
          break;
        case 'Home':
          event.preventDefault();
          goToFirst();
          break;
        case 'End':
          event.preventDefault();
          goToLast();
          break;
        case 'Escape':
          event.preventDefault();
          onStartNew();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext, goToFirst, goToLast, onStartNew]);

  const selectedImage = rankings[selectedImageIndex];

  return (
    <div className="ranking-results" role="main" aria-label="Ranking results interface">
      {/* Header with actions */}
      <div className="ranking-header">
        <div className="ranking-title">
          <h2 id="ranking-title">Ranking Results</h2>
          <p aria-describedby="ranking-title">{rankings.length} images ranked from best to worst</p>
        </div>
        <div className="ranking-actions" role="toolbar" aria-label="Ranking actions">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="download-results-button"
            type="button"
            aria-describedby="ranking-title"
          >
            {isDownloading ? 'Downloading...' : 'Download Results'}
          </button>
          <button
            onClick={onStartNew}
            className="start-new-button"
            type="button"
            aria-label="Start a new ranking session"
          >
            Start New Ranking
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="ranking-content">
        {/* Left panel - Ranking list */}
        <div className="ranking-list-panel">
          <div className="ranking-list-header">
            <h3 id="ranking-list-title">Ranking List</h3>
          </div>
          <div 
            className="ranking-list" 
            role="listbox" 
            aria-labelledby="ranking-list-title"
            aria-activedescendant={`ranking-item-${selectedImageIndex}`}
          >
            {rankings.map((result, index) => (
              <div
                key={result.image.path}
                id={`ranking-item-${index}`}
                className={`ranking-item ${index === selectedImageIndex ? 'selected' : ''}`}
                onClick={() => onImageSelect(index)}
                role="option"
                aria-selected={index === selectedImageIndex}
                tabIndex={index === selectedImageIndex ? 0 : -1}
                aria-label={`Rank ${result.rank}: ${result.image.path.split('/').pop() || result.image.path}, Score: ${result.score.toFixed(2)}`}
              >
                <div className="ranking-position">
                  <span className="rank-number" aria-hidden="true">#{result.rank}</span>
                </div>
                <div className="ranking-thumbnail">
                  <img
                    src={result.image.url}
                    alt=""
                    className="thumbnail-image"
                    loading="lazy"
                    aria-hidden="true"
                  />
                </div>
                <div className="ranking-info">
                  <div className="image-name">
                    {result.image.path.split('/').pop() || result.image.path}
                  </div>
                  <div className="ranking-score">
                    Score: {result.score.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel - Large preview */}
        <div className="ranking-preview-panel" role="region" aria-label="Image preview">
          {selectedImage ? (
            <>
              <div className="preview-header">
                <div className="preview-info">
                  <h3 id="preview-title">Rank #{selectedImage.rank}</h3>
                  <p className="preview-filename" aria-describedby="preview-title">
                    {selectedImage.image.path.split('/').pop() || selectedImage.image.path}
                  </p>
                  <p className="preview-score">
                    Score: {selectedImage.score.toFixed(2)}
                  </p>
                </div>
                <div className="preview-navigation" role="toolbar" aria-label="Image navigation">
                  <button
                    onClick={goToFirst}
                    disabled={selectedImageIndex === 0}
                    className="nav-button first-button"
                    type="button"
                    aria-label="Go to first image (Home key)"
                  >
                    <span aria-hidden="true">⏮</span>
                  </button>
                  <button
                    onClick={goToPrevious}
                    disabled={selectedImageIndex === 0}
                    className="nav-button prev-button"
                    type="button"
                    aria-label="Go to previous image (Left arrow key)"
                  >
                    <span aria-hidden="true">←</span>
                  </button>
                  <span className="nav-position" aria-live="polite">
                    {selectedImageIndex + 1} of {rankings.length}
                  </span>
                  <button
                    onClick={goToNext}
                    disabled={selectedImageIndex === rankings.length - 1}
                    className="nav-button next-button"
                    type="button"
                    aria-label="Go to next image (Right arrow key)"
                  >
                    <span aria-hidden="true">→</span>
                  </button>
                  <button
                    onClick={goToLast}
                    disabled={selectedImageIndex === rankings.length - 1}
                    className="nav-button last-button"
                    type="button"
                    aria-label="Go to last image (End key)"
                  >
                    <span aria-hidden="true">⏭</span>
                  </button>
                </div>
              </div>
              <div className="preview-image-container">
                <img
                  src={selectedImage.image.url}
                  alt={`Ranked number ${selectedImage.rank}: ${selectedImage.image.path.split('/').pop() || selectedImage.image.path}. Score: ${selectedImage.score.toFixed(2)}`}
                  className="preview-image"
                />
              </div>
              <div className="keyboard-shortcuts-hint" role="complementary" aria-label="Keyboard shortcuts">
                <p>
                  <strong>Keyboard shortcuts:</strong> Left/Right arrows to navigate, Home/End for first/last image, Escape to start new ranking
                </p>
              </div>
            </>
          ) : (
            <div className="no-selection" role="status">
              <p>Select an image from the ranking list to preview</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Live region for navigation announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {selectedImage && (
          `Viewing rank ${selectedImage.rank}: ${selectedImage.image.path.split('/').pop() || selectedImage.image.path}`
        )}
      </div>
    </div>
  );
};

export default RankingResults;