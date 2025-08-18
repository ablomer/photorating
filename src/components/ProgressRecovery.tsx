import React from 'react';
import type { StorageInfo } from '../types';
import { formatProgressTimestamp } from '../utils/progressStorage';

interface ProgressRecoveryProps {
  storageInfo: StorageInfo;
  onRestore: () => void;
  onDownloadResults: () => void;
  isLoading?: boolean;
}

const ProgressRecovery: React.FC<ProgressRecoveryProps> = ({
  storageInfo,
  onRestore,
  onDownloadResults,
  isLoading = false
}) => {
  if (!storageInfo.hasStoredProgress) return null;

  return (
    <div className="progress-recovery-banner">
      <div className="progress-recovery-content">
        <div className="progress-recovery-icon">💾</div>
        <div className="progress-recovery-text">
          <h3>Previous Session Found</h3>
          <p>
            Found saved progress from {formatProgressTimestamp(storageInfo.timestamp!)} 
            {storageInfo.zipFileName && ` for "${storageInfo.zipFileName}"`}
          </p>
          <div className="progress-stats">
            {storageInfo.imageCount && (
              <span>{storageInfo.imageCount} images</span>
            )}
            {storageInfo.imageCount && (
              <span> • {storageInfo.ratedCount ? `${storageInfo.ratedCount} ratings` : 'No ratings'}</span>
            )}
          </div>
        </div>
        <div className="progress-recovery-actions">
          <button
            onClick={onRestore}
            disabled={isLoading}
            className="restore-button"
            type="button"
          >
            Upload Same Zip to Restore
          </button>
          <button
            onClick={onDownloadResults}
            disabled={isLoading}
            className="download-button"
            type="button"
          >
            Download Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressRecovery;
