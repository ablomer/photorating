import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { ImageData, Rating } from './types';
import { extractImagesFromZip, cleanupImageUrls } from './utils/zipHandler';
import StarRating from './components/StarRating';
import RatingsList from './components/RatingsList';
import ActionsDropdown from './components/ActionsDropdown';
import ProgressRecovery from './components/ProgressRecovery';
import SaveStatus from './components/SaveStatus';
import Notes from './components/Notes';
import SettingsModal from './components/SettingsModal';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useProgressManager } from './hooks/useProgressManager';
import { reorderImagesFromSavedOrder, extractResultsFromProgress, generateRatingResults, downloadRatingResults } from './utils/progressStorage';
import './App.css';

const calculateAverage = (ratings: Rating[]): number => {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating.value, 0);
  return Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal place
};

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [imageRatings, setImageRatings] = useState<{ [imagePath: string]: Rating[] }>({});
  const [imageNotes, setImageNotes] = useState<{ [imagePath: string]: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [zipFileName, setZipFileName] = useState<string>('');
  const [showProgressRecovery, setShowProgressRecovery] = useState<boolean>(false);
  const [isRestoreMode, setIsRestoreMode] = useState<boolean>(false);
  const [shuffleImages, setShuffleImages] = useState<boolean>(false);
  const [stagedZipFile, setStagedZipFile] = useState<File | null>(null);
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Create filtered images array based on minimum rating filter
  const filteredImages = useMemo(() => {
    if (minRatingFilter === 0) {
      return images; // No filter, return all images
    }
    
    return images.filter(image => {
      const ratings = imageRatings[image.path] || [];
      if (ratings.length === 0) {
        return false; // No ratings means it doesn't meet the minimum threshold
      }
      const average = calculateAverage(ratings);
      return average >= minRatingFilter;
    });
  }, [images, imageRatings, minRatingFilter]);

  const currentImage = filteredImages[currentImageIndex];

  // Reset currentImageIndex when filter changes and current index is out of bounds
  useEffect(() => {
    if (filteredImages.length > 0 && currentImageIndex >= filteredImages.length) {
      setCurrentImageIndex(0);
    }
  }, [filteredImages.length, currentImageIndex]);

  // Initialize progress manager
  const {
    saveProgressData,
    loadProgressData,
    clearProgressData,
    storageInfo,
    isAutoSaving,
    lastSaveTime
  } = useProgressManager({
    images,
    currentImageIndex,
    imageRatings,
    imageNotes,
    zipFileName
  });

  // Check for stored progress on app load
  useEffect(() => {
    if (storageInfo.hasStoredProgress && images.length === 0 && !isRestoreMode) {
      setShowProgressRecovery(true);
    } else {
      setShowProgressRecovery(false);
    }
  }, [storageInfo.hasStoredProgress, images.length, isRestoreMode]);

  const processZipFile = async (file: File, clearExistingProgress = true) => {
    setIsLoading(true);
    setError(null);

    try {
      // Clean up previous image URLs
      if (images.length > 0) {
        cleanupImageUrls(images);
      }

      const extractedImages = await extractImagesFromZip(file, clearExistingProgress && shuffleImages);
      
      if (extractedImages.length === 0) {
        setError('No images found in the zip file.');
        return;
      }

      let finalImages = extractedImages;
      setZipFileName(file.name);
      
      if (clearExistingProgress) {
        setImageRatings({});
        setImageNotes({});
        setCurrentImageIndex(0);
        clearProgressData(); // Clear any stored progress when loading new zip
      } else {
        // Try to restore progress for the same zip file
        const progressData = await loadProgressData();
        if (progressData && storageInfo.zipFileName === file.name) {
          // Reorder images to match the saved order if available
          if (progressData.imageOrder && progressData.imageOrder.length === extractedImages.length) {
            finalImages = reorderImagesFromSavedOrder(extractedImages, progressData.imageOrder);
          }
          setImageRatings(progressData.imageRatings);
          setImageNotes(progressData.imageNotes);
          setCurrentImageIndex(progressData.currentImageIndex);
        } else {
          setImageRatings({});
          setImageNotes({});
          setCurrentImageIndex(0);
        }
      }
      
      setImages(finalImages);
      
      setShowProgressRecovery(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process zip file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleZipUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Stage the file instead of immediately processing it
    setStagedZipFile(file);
    setError(null);
    setIsRestoreMode(false);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    // Only set dragOver to false if we're leaving the drop zone entirely
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    const zipFile = files.find(file => file.name.toLowerCase().endsWith('.zip'));

    if (!zipFile) {
      setError('Please drop a zip file.');
      return;
    }

    // Stage the file instead of immediately processing it
    setStagedZipFile(zipFile);
    setError(null);
    setIsRestoreMode(false);
  };

  const addRating = useCallback((rating: number) => {
    if (!currentImage) return;

    const newRating: Rating = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      value: rating,
      timestamp: Date.now()
    };

    setImageRatings(prev => ({
      ...prev,
      [currentImage.path]: [...(prev[currentImage.path] || []), newRating]
    }));
  }, [currentImage]);

  const editRating = useCallback((ratingId: string, newValue: number) => {
    if (!currentImage) return;

    setImageRatings(prev => ({
      ...prev,
      [currentImage.path]: prev[currentImage.path]?.map(rating =>
        rating.id === ratingId ? { ...rating, value: newValue } : rating
      ) || []
    }));
  }, [currentImage]);

  const deleteRating = useCallback((ratingId: string) => {
    if (!currentImage) return;

    setImageRatings(prev => ({
      ...prev,
      [currentImage.path]: prev[currentImage.path]?.filter(rating =>
        rating.id !== ratingId
      ) || []
    }));
  }, [currentImage]);

  const deleteLastRating = useCallback(() => {
    if (!currentImage) return;
    
    const currentRatings = imageRatings[currentImage.path] || [];
    if (currentRatings.length === 0) return;

    // Remove the most recently added rating (last in array)
    const lastRating = currentRatings[currentRatings.length - 1];
    deleteRating(lastRating.id);
  }, [currentImage, imageRatings, deleteRating]);

  const updateNotes = useCallback((notes: string) => {
    if (!currentImage) return;

    setImageNotes(prev => ({
      ...prev,
      [currentImage.path]: notes
    }));
  }, [currentImage]);

  const goToPrevious = useCallback(() => {
    if (filteredImages.length === 0) return;
    setCurrentImageIndex(prev => prev > 0 ? prev - 1 : filteredImages.length - 1);
  }, [filteredImages.length]);

  const goToNext = useCallback(() => {
    if (filteredImages.length === 0) return;
    setCurrentImageIndex(prev => prev < filteredImages.length - 1 ? prev + 1 : 0);
  }, [filteredImages.length]);

  const downloadResults = () => {
    const results = generateRatingResults(imageRatings, imageNotes, calculateAverage);
    
    // Use the zip filename for a more descriptive download name
    const baseFileName = zipFileName ? 
      zipFileName.replace('.zip', '') : 
      'image-ratings';
    const fileName = `${baseFileName}-results.json`;
    
    downloadRatingResults(results, fileName);
  };

  const handleRestoreProgress = () => {
    // Enter restore mode - this will show a special upload interface
    setIsRestoreMode(true);
    setShowProgressRecovery(false);
    setError(`Please upload the zip file "${storageInfo.zipFileName}" to restore your progress`);
  };

  const handleDownloadStoredResults = () => {
    const results = extractResultsFromProgress();
    if (!results) {
      setError('No stored results found to download');
      return;
    }

    // Use the zip filename for a more descriptive download name
    const baseFileName = storageInfo.zipFileName ? 
      storageInfo.zipFileName.replace('.zip', '') : 
      'image-ratings';
    const fileName = `${baseFileName}-results.json`;
    
    downloadRatingResults(results, fileName);
  };

  const handleRestoreZipUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if this is the correct zip file for restoration
    if (file.name !== storageInfo.zipFileName) {
      setError(`Please upload the correct zip file: "${storageInfo.zipFileName}"`);
      return;
    }

    // Process the zip without shuffling (preserve original order)
    await processZipFile(file, false);
    setIsRestoreMode(false);
  };

  const handleRestoreDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    const zipFile = files.find(file => file.name.toLowerCase().endsWith('.zip'));

    if (!zipFile) {
      setError('Please drop a zip file.');
      return;
    }

    // Check if this is the correct zip file for restoration
    if (zipFile.name !== storageInfo.zipFileName) {
      setError(`Please upload the correct zip file: "${storageInfo.zipFileName}"`);
      return;
    }

    // Process the zip without shuffling (preserve original order)
    await processZipFile(zipFile, false);
    setIsRestoreMode(false);
  };

  const handleStartRating = async () => {
    if (!stagedZipFile) return;

    // Process the staged zip file
    await processZipFile(stagedZipFile, true);
    setStagedZipFile(null);
    setIsRestoreMode(false);
  };

  const handleClearStagedFile = () => {
    setStagedZipFile(null);
    setError(null);
  };

  const handleOpenSettings = () => {
    setIsSettingsModalOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsModalOpen(false);
  };



  // Enable keyboard shortcuts when images are loaded
  useKeyboardShortcuts({
    onRate: addRating,
    onPrevious: goToPrevious,
    onNext: goToNext,
    onDeleteLast: deleteLastRating,
    isEnabled: filteredImages.length > 0
  });

  const currentRatings = currentImage ? imageRatings[currentImage.path] || [] : [];
  const currentAverage = calculateAverage(currentRatings);

  return (
    <div className="app">
      {/* Progress Recovery Banner */}
      {showProgressRecovery && (
        <ProgressRecovery
          storageInfo={storageInfo}
          onRestore={handleRestoreProgress}
          onDownloadResults={handleDownloadStoredResults}
          isLoading={isLoading}
        />
      )}

      {images.length === 0 && (
        <header className="app-header">
          <h1>Photo Rating App</h1>
          <p>Upload a zip file containing images to start rating</p>
        </header>
      )}

      <main className={`app-main ${images.length > 0 ? 'fullscreen-main' : ''}`}>
        {images.length === 0 ? (
          <div className="upload-section">
            {/* Show warning if there's stored progress that will be overwritten */}
            {storageInfo.hasStoredProgress && !isRestoreMode && !stagedZipFile && (
              <div className="overwrite-warning">
                <div className="warning-icon">⚠️</div>
                <div className="warning-text">
                  <strong>Previous session found</strong>
                  <br />
                  Uploading a new zip will overwrite your saved progress
                </div>
              </div>
            )}

            {/* Show staged file info or upload area */}
            {stagedZipFile && !isRestoreMode ? (
              <div className="staged-file-section">
                <div className="staged-file-info">
                  <div className="staged-file-icon">✅</div>
                  <div className="staged-file-text">
                    <strong>File ready:</strong>
                    <br />
                    {stagedZipFile.name}
                  </div>
                  <button
                    onClick={handleClearStagedFile}
                    className="clear-staged-button"
                    type="button"
                    disabled={isLoading}
                  >
                    ✕
                  </button>
                </div>
                
                {/* Shuffle option for staged file */}
                <div className="upload-options">
                  <label className="shuffle-option">
                    <input
                      type="checkbox"
                      checked={shuffleImages}
                      onChange={(e) => setShuffleImages(e.target.checked)}
                      disabled={isLoading}
                    />
                    <span>Shuffle image order</span>
                  </label>
                </div>

                {/* Start button */}
                <div className="start-section">
                  <button
                    onClick={handleStartRating}
                    disabled={isLoading}
                    className="start-button"
                    type="button"
                  >
                    {isLoading ? 'Processing...' : 'Start Rating'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <label htmlFor={isRestoreMode ? "restore-zip-upload" : "zip-upload"} className="upload-label">
                  <div 
                    className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={isRestoreMode ? handleRestoreDrop : handleDrop}
                  >
                    <div className="upload-icon">📁</div>
                    <div className="upload-text">
                      {isRestoreMode ? (
                        <>
                          <strong>Upload "{storageInfo.zipFileName}" to restore</strong>
                          <br />
                          Your progress will be restored
                        </>
                      ) : (
                        <>
                          <strong>Choose a zip file</strong>
                          <br />
                          or drag and drop it here
                        </>
                      )}
                    </div>
                  </div>
                </label>
                
                {/* Main upload input */}
                {!isRestoreMode && (
                  <input
                    id="zip-upload"
                    type="file"
                    accept=".zip"
                    onChange={handleZipUpload}
                    disabled={isLoading}
                    className="upload-input"
                  />
                )}
                
                {/* Restore upload input */}
                {isRestoreMode && (
                  <input
                    id="restore-zip-upload"
                    type="file"
                    accept=".zip"
                    onChange={handleRestoreZipUpload}
                    disabled={isLoading}
                    className="upload-input"
                  />
                )}
                
                {/* Show shuffle option only for fresh uploads when no file is staged */}
                {!isRestoreMode && !stagedZipFile && (
                  <div className="upload-options">
                    <label className="shuffle-option">
                      <input
                        type="checkbox"
                        checked={shuffleImages}
                        onChange={(e) => setShuffleImages(e.target.checked)}
                        disabled={isLoading}
                      />
                      <span>Shuffle image order</span>
                    </label>
                  </div>
                )}
                
                {/* Back button for restore mode */}
                {isRestoreMode && (
                  <div className="restore-actions">
                    <button
                      onClick={() => setIsRestoreMode(false)}
                      disabled={isLoading}
                      className="back-button"
                      type="button"
                    >
                      ← Back to Fresh Upload
                    </button>
                  </div>
                )}
              </>
            )}
            
            {isLoading && <p className="loading">Processing zip file...</p>}
            {error && <p className="error">{error}</p>}
          </div>
                ) : filteredImages.length === 0 ? (
          <div className="no-filtered-images">
            <div className="filter-controls">
              <label htmlFor="rating-filter">Min Rating:</label>
              <select
                id="rating-filter"
                value={minRatingFilter}
                onChange={(e) => setMinRatingFilter(Number(e.target.value))}
                className="rating-filter-select"
              >
                <option value={0}>All images</option>
                <option value={1}>≥ 1 star</option>
                <option value={2}>≥ 2 stars</option>
                <option value={3}>≥ 3 stars</option>
                <option value={4}>≥ 4 stars</option>
                <option value={5}>5 stars only</option>
              </select>
            </div>
            <h2>No images match the current filter</h2>
            <p>No images have an average rating of {minRatingFilter} stars or higher.</p>
            <p>Try lowering the minimum rating filter or rate more images first.</p>
            <p className="total-images">Total images: {images.length}</p>
          </div>
                ) : (
          <div className="fullscreen-interface">
            {/* Fullscreen Background Image */}
            <div 
              className="fullscreen-image"
              style={{ backgroundImage: `url(${currentImage.url})` }}
            />

            {/* Top Overlay - Image Info and Actions */}
            <div className="top-overlay">
              <div className="image-info">
                <h2>Image {currentImageIndex + 1} of {filteredImages.length}{minRatingFilter > 0 && ("*")}</h2>
                <p className="image-path">{currentImage.path}</p>
              </div>
              <div className="top-overlay-right">
                <SaveStatus
                  isAutoSaving={isAutoSaving}
                  lastSaveTime={lastSaveTime}
                  onManualSave={saveProgressData}
                />
                <ActionsDropdown
                  onDownloadResults={downloadResults}
                  onUploadNewZip={handleZipUpload}
                  onOpenSettings={handleOpenSettings}
                  isLoading={isLoading}
                />
              </div>
      </div>

            {/* Navigation Overlay - Left and Right */}
            <button 
              onClick={goToPrevious}
              className="nav-overlay nav-left"
              disabled={filteredImages.length <= 1}
              aria-label="Previous image"
            >
              ←
            </button>
            <button 
              onClick={goToNext}
              className="nav-overlay nav-right"
              disabled={filteredImages.length <= 1}
              aria-label="Next image"
            >
              →
        </button>

            {/* Bottom Left Overlay - Rating Controls */}
            <div className="bottom-left-overlay">
              <div className="rating-section">
                <h3>Add New Rating</h3>
                <StarRating onRate={addRating} />
                <p className="keyboard-hint">
                  Keyboard: 1-5 for ratings, ← → navigation, Delete removes last rating
                </p>
              </div>
              <Notes
                notes={imageNotes[currentImage.path] || ''}
                onNotesChange={updateNotes}
                imagePath={currentImage.path}
              />
            </div>

            {/* Bottom Right Overlay - Ratings List */}
            <div className="bottom-right-overlay">
              <RatingsList
                ratings={currentRatings}
                onEditRating={editRating}
                onDeleteRating={deleteRating}
                average={currentAverage}
              />
            </div>


          </div>
        )}
      </main>
      
      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={handleCloseSettings}
        minRatingFilter={minRatingFilter}
        onMinRatingFilterChange={setMinRatingFilter}
        totalImages={images.length}
        filteredImages={filteredImages.length}
      />
    </div>
  );
}

export default App
