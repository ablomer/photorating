import React from 'react';
import { formatProgressTimestamp } from '../utils/progressStorage';

interface SaveStatusProps {
  isAutoSaving: boolean;
  lastSaveTime: number | null;
  onManualSave: () => void;
}

const SaveStatus: React.FC<SaveStatusProps> = ({
  isAutoSaving,
  lastSaveTime,
  onManualSave
}) => {
  const getSaveStatusText = () => {
    if (isAutoSaving) return 'Saving...';
    if (lastSaveTime) return `Saved ${formatProgressTimestamp(lastSaveTime)}`;
    return 'Not saved';
  };

  const getSaveStatusIcon = () => {
    if (isAutoSaving) return '⏳';
    if (lastSaveTime) return '✅';
    return '💾';
  };

  return (
    <div className="save-status">
      <div className="save-status-info">
        <span className="save-status-icon">{getSaveStatusIcon()}</span>
        <span className="save-status-text">{getSaveStatusText()}</span>
      </div>
      <button
        onClick={onManualSave}
        disabled={isAutoSaving}
        className="manual-save-button"
        type="button"
        title="Save progress now"
      >
        Save Now
      </button>
    </div>
  );
};

export default SaveStatus;
