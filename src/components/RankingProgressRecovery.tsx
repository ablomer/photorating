import React from 'react';
import type { StorageInfo } from '../types';
import { formatProgressTimestamp } from '../utils/progressStorage';

interface RankingProgressRecoveryProps {
  storageInfo: StorageInfo & { 
    mode?: 'ranking'; 
    completedComparisons?: number; 
    totalComparisons?: number; 
  };
  onRestore: () => void;
  onDownloadResults?: () => void;
  onStartNew: () => void;
  isLoading?: boolean;
}

const RankingProgressRecovery: React.FC<RankingProgressRecoveryProps> = ({
  storageInfo,
  onRestore,
  onDownloadResults,
  onStartNew,
  isLoading = false
}) => {
  if (!storageInfo.hasStoredProgress) return null;

  const progressPercentage = storageInfo.completedComparisons && storageInfo.totalComparisons
    ? Math.round((storageInfo.completedComparisons / storageInfo.totalComparisons) * 100)
    : 0;

  const isComplete = progressPercentage === 100;

  return (
    <div className="progress-recovery-banner">
      <div className="progress-recovery-content">
        <div className="progress-recovery-icon">🏆</div>
        <div className="progress-recovery-text">
          <h3>{isComplete ? 'Completed Ranking Found' : 'Previous Ranking Session Found'}</h3>
          <p>
            Found saved ranking progress from {formatProgressTimestamp(storageInfo.timestamp!)} 
            {storageInfo.zipFileName && ` for "${storageInfo.zipFileName}"`}
          </p>
          <div className="progress-stats">
            {storageInfo.imageCount && (
              <span>{storageInfo.imageCount} images</span>
            )}
            {storageInfo.completedComparisons !== undefined && storageInfo.totalComparisons && (
              <span> • {storageInfo.completedComparisons}/{storageInfo.totalComparisons} comparisons ({progressPercentage}%)</span>
            )}
          </div>
          {!isComplete && (
            <div className="progress-bar">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}
        </div>
        <div className="progress-recovery-actions">
          {!isComplete && (
            <button
              onClick={onRestore}
              disabled={isLoading}
              className="restore-button"
              type="button"
            >
              Upload Same Zip to Continue
            </button>
          )}
          {isComplete && onDownloadResults && (
            <button
              onClick={onDownloadResults}
              disabled={isLoading}
              className="download-button"
              type="button"
            >
              Download Results
            </button>
          )}
          <button
            onClick={onStartNew}
            disabled={isLoading}
            className="start-new-button"
            type="button"
          >
            Start New Ranking
          </button>
        </div>
      </div>
    </div>
  );
};

export default RankingProgressRecovery;