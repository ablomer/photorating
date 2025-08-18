import { useState, useEffect, useCallback, useRef } from 'react';
import type { ImageData, Rating, StorageInfo } from '../types';
import {
  saveProgress,
  loadProgress,
  clearProgress,
  getStorageInfo,
  generateSessionId,
  areImagesCompatible
} from '../utils/progressStorage';

interface UseProgressManagerReturn {
  sessionId: string;
  saveProgressData: () => void;
  loadProgressData: () => Promise<{
    imageRatings: { [imagePath: string]: Rating[] };
    imageNotes: { [imagePath: string]: string };
    currentImageIndex: number;
    imageOrder?: string[];
  } | null>;
  clearProgressData: () => void;
  storageInfo: StorageInfo;
  isAutoSaving: boolean;
  lastSaveTime: number | null;
}

interface UseProgressManagerProps {
  images: ImageData[];
  currentImageIndex: number;
  imageRatings: { [imagePath: string]: Rating[] };
  imageNotes: { [imagePath: string]: string };
  zipFileName: string;
}

export const useProgressManager = ({
  images,
  currentImageIndex,
  imageRatings,
  imageNotes,
  zipFileName
}: UseProgressManagerProps): UseProgressManagerReturn => {
  const [sessionId] = useState(() => generateSessionId());
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({ hasStoredProgress: false });
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  
  // Use refs to track the latest values for auto-save
  const latestDataRef = useRef({ images, currentImageIndex, imageRatings, imageNotes, zipFileName });
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update refs when props change
  useEffect(() => {
    latestDataRef.current = { images, currentImageIndex, imageRatings, imageNotes, zipFileName };
  }, [images, currentImageIndex, imageRatings, imageNotes, zipFileName]);

  // Check for stored progress on mount
  useEffect(() => {
    const info = getStorageInfo();
    setStorageInfo(info);
  }, []);

  // Auto-save with debouncing
  const scheduleAutoSave = useCallback(() => {
    if (latestDataRef.current.images.length === 0) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Schedule new save after 2 seconds of inactivity
    autoSaveTimeoutRef.current = setTimeout(() => {
      setIsAutoSaving(true);
      const { images: currentImages, currentImageIndex: currentIndex, imageRatings: currentRatings, imageNotes: currentNotes, zipFileName: currentZipName } = latestDataRef.current;
      
      saveProgress(
        sessionId,
        currentIndex,
        currentRatings,
        currentNotes,
        currentImages,
        currentZipName
      );
      
      setLastSaveTime(Date.now());
      setIsAutoSaving(false);
      
      // Update storage info
      const info = getStorageInfo();
      setStorageInfo(info);
    }, 2000);
  }, [sessionId]);

  // Trigger auto-save when ratings or notes change
  useEffect(() => {
    if (images.length > 0) {
      scheduleAutoSave();
    }
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [imageRatings, imageNotes, currentImageIndex, scheduleAutoSave, images.length]);

  // Manual save function
  const saveProgressData = useCallback(() => {
    if (images.length === 0) return;
    
    setIsAutoSaving(true);
    saveProgress(sessionId, currentImageIndex, imageRatings, imageNotes, images, zipFileName);
    setLastSaveTime(Date.now());
    setIsAutoSaving(false);
    
    // Update storage info
    const info = getStorageInfo();
    setStorageInfo(info);
  }, [sessionId, currentImageIndex, imageRatings, imageNotes, images, zipFileName]);

  // Load progress function
  const loadProgressData = useCallback(async (): Promise<{
    imageRatings: { [imagePath: string]: Rating[] };
    imageNotes: { [imagePath: string]: string };
    currentImageIndex: number;
    imageOrder?: string[];
  } | null> => {
    const progressData = loadProgress();
    if (!progressData) return null;

    // If we have current images, check compatibility
    if (images.length > 0) {
      const isCompatible = areImagesCompatible(progressData.imageMetadata, images);
      if (!isCompatible) {
        console.warn('Stored progress is not compatible with current images');
        return null;
      }
    }

    return {
      imageRatings: progressData.imageRatings,
      imageNotes: progressData.imageNotes || {},
      currentImageIndex: progressData.currentImageIndex,
      imageOrder: progressData.imageOrder
    };
  }, [images]);

  // Clear progress function
  const clearProgressData = useCallback(() => {
    clearProgress();
    setStorageInfo({ hasStoredProgress: false });
    setLastSaveTime(null);
  }, []);

  // Save progress before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (images.length > 0) {
        saveProgress(sessionId, currentImageIndex, imageRatings, imageNotes, images, zipFileName);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionId, currentImageIndex, imageRatings, imageNotes, images, zipFileName]);

  return {
    sessionId,
    saveProgressData,
    loadProgressData,
    clearProgressData,
    storageInfo,
    isAutoSaving,
    lastSaveTime
  };
};
