import React from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  minRatingFilter: number;
  onMinRatingFilterChange: (value: number) => void;
  totalImages: number;
  filteredImages: number;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  minRatingFilter,
  onMinRatingFilterChange,
  totalImages,
  filteredImages
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="settings-modal">
        <div className="modal-header">
          <h2>Settings</h2>
          <button
            className="modal-close-button"
            onClick={onClose}
            type="button"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>
        
        <div className="modal-content">
          <div className="setting-group">
            <h3>Photo Filter</h3>
            <div className="filter-setting">
              <label htmlFor="modal-rating-filter">Minimum Rating:</label>
              <select
                id="modal-rating-filter"
                value={minRatingFilter}
                onChange={(e) => onMinRatingFilterChange(Number(e.target.value))}
                className="modal-rating-filter-select"
              >
                <option value={0}>All images</option>
                <option value={1}>≥ 1 star</option>
                <option value={2}>≥ 2 stars</option>
                <option value={3}>≥ 3 stars</option>
                <option value={4}>≥ 4 stars</option>
                <option value={5}>5 stars only</option>
              </select>
            </div>
            
            <div className="filter-status">
              {minRatingFilter > 0 ? (
                <p>
                  <strong>Currently showing:</strong> {filteredImages} of {totalImages} images
                  <br />
                  <span className="filter-description">
                    Images with average rating ≥ {minRatingFilter} stars
                  </span>
                </p>
              ) : (
                <p>
                  <strong>Currently showing:</strong> All {totalImages} images
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button
            className="modal-close-footer-button"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
