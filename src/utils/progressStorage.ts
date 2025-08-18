import type { ProgressData, StorageInfo, ImageData, Rating } from '../types';

const STORAGE_KEY = 'photorating_progress';
const SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Generates a unique session ID
 */
export const generateSessionId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

/**
 * Saves progress data to localStorage
 */
export const saveProgress = (
  sessionId: string,
  currentImageIndex: number,
  imageRatings: { [imagePath: string]: Rating[] },
  imageNotes: { [imagePath: string]: string },
  images: ImageData[],
  zipFileName: string
): void => {
  try {
    const progressData: ProgressData = {
      sessionId,
      timestamp: Date.now(),
      currentImageIndex,
      imageRatings,
      imageNotes,
      imageMetadata: images.map(img => ({
        path: img.path,
        size: img.blob.size,
        lastModified: img.blob instanceof File ? img.blob.lastModified : Date.now()
      })),
      imageOrder: images.map(img => img.path), // Preserve exact order
      zipFileName
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
  } catch (error) {
    console.warn('Failed to save progress:', error);
  }
};

/**
 * Loads progress data from localStorage
 */
export const loadProgress = (): ProgressData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const progressData: ProgressData = JSON.parse(stored);
    
    // Check if the stored data is not too old
    const isExpired = Date.now() - progressData.timestamp > SESSION_TIMEOUT;
    if (isExpired) {
      clearProgress();
      return null;
    }

    return progressData;
  } catch (error) {
    console.warn('Failed to load progress:', error);
    clearProgress(); // Clear corrupted data
    return null;
  }
};

/**
 * Gets information about stored progress without loading the full data
 */
export const getStorageInfo = (): StorageInfo => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { hasStoredProgress: false };
    }

    const progressData: ProgressData = JSON.parse(stored);
    
    // Check if expired
    const isExpired = Date.now() - progressData.timestamp > SESSION_TIMEOUT;
    if (isExpired) {
      clearProgress();
      return { hasStoredProgress: false };
    }

    const ratedCount = Object.values(progressData.imageRatings)
      .reduce((total, ratings) => total + ratings.length, 0);

    return {
      hasStoredProgress: true,
      sessionId: progressData.sessionId,
      timestamp: progressData.timestamp,
      zipFileName: progressData.zipFileName,
      imageCount: progressData.imageMetadata.length,
      ratedCount
    };
  } catch (error) {
    console.warn('Failed to get storage info:', error);
    clearProgress();
    return { hasStoredProgress: false };
  }
};

/**
 * Clears stored progress data
 */
export const clearProgress = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear progress:', error);
  }
};

/**
 * Checks if two image sets are compatible (same images)
 */
export const areImagesCompatible = (
  storedMetadata: ProgressData['imageMetadata'],
  currentImages: ImageData[]
): boolean => {
  if (storedMetadata.length !== currentImages.length) {
    return false;
  }

  return storedMetadata.every((stored, index) => {
    const current = currentImages[index];
    return stored.path === current.path && 
           stored.size === current.blob.size;
  });
};

/**
 * Reorders images to match the saved order
 */
export const reorderImagesFromSavedOrder = (
  images: ImageData[],
  savedOrder: string[]
): ImageData[] => {
  if (savedOrder.length !== images.length) {
    console.warn('Saved order length does not match current images length');
    return images;
  }

  // Create a map for quick lookup
  const imageMap = new Map<string, ImageData>();
  images.forEach(img => imageMap.set(img.path, img));

  // Reorder based on saved order
  const reorderedImages: ImageData[] = [];
  for (const path of savedOrder) {
    const image = imageMap.get(path);
    if (image) {
      reorderedImages.push(image);
    } else {
      console.warn(`Image not found for path: ${path}`);
      // If we can't find an image, fall back to original order
      return images;
    }
  }

  return reorderedImages;
};

/**
 * Formats timestamp for display
 */
export const formatProgressTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - timestamp;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};

/**
 * Generates standardized rating results from rating data
 */
export const generateRatingResults = (
  imageRatings: { [imagePath: string]: Rating[] },
  imageNotes: { [imagePath: string]: string },
  calculateAverage: (ratings: Rating[]) => number
): { [imagePath: string]: { ratings: number[]; average: number; notes?: string } } => {
  const results: { [imagePath: string]: { ratings: number[]; average: number; notes?: string } } = {};
  
  // Get all unique image paths from both ratings and notes
  const allImagePaths = new Set([
    ...Object.keys(imageRatings),
    ...Object.keys(imageNotes)
  ]);
  
  allImagePaths.forEach(imagePath => {
    const ratings = imageRatings[imagePath] || [];
    const notes = imageNotes[imagePath];
    const ratingValues = ratings.map(rating => rating.value);
    
    results[imagePath] = {
      ratings: ratingValues,
      average: calculateAverage(ratings),
      ...(notes && notes.trim() && { notes: notes.trim() })
    };
  });

  return results;
};

/**
 * Extracts rating results from stored progress data using the standard format
 */
export const extractResultsFromProgress = (): { [imagePath: string]: { ratings: number[]; average: number; notes?: string } } | null => {
  try {
    const progressData = loadProgress();
    if (!progressData) return null;

    // Helper function to calculate average (matching App.tsx logic)
    const calculateAverage = (ratings: Rating[]): number => {
      if (ratings.length === 0) return 0;
      const sum = ratings.reduce((acc, rating) => acc + rating.value, 0);
      return Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal place
    };

    return generateRatingResults(progressData.imageRatings, progressData.imageNotes || {}, calculateAverage);
  } catch (error) {
    console.warn('Failed to extract results from progress:', error);
    return null;
  }
};

/**
 * Downloads rating results as JSON file
 */
export const downloadRatingResults = (
  results: { [imagePath: string]: { ratings: number[]; average: number; notes?: string } },
  fileName: string = 'image-ratings.json'
): void => {
  const dataStr = JSON.stringify(results, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
