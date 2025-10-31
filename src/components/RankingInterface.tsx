import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ImageData, RankingSession, RankingResult } from '../types';
import { RankingAlgorithm } from '../utils/rankingAlgorithm';
import ComparisonView from './ComparisonView';

interface RankingInterfaceProps {
  images: ImageData[];
  onComplete: (rankings: RankingResult[]) => void;
  onProgressSave?: (session: RankingSession) => void;
  initialSession?: RankingSession;
}

const RankingInterface: React.FC<RankingInterfaceProps> = ({
  images,
  onComplete,
  onProgressSave,
  initialSession
}) => {
  const [session, setSession] = useState<RankingSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  // Refs for focus management
  const mainContentRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Initialize or restore ranking session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsInitializing(true);
        setError(null);

        let newSession: RankingSession;

        if (initialSession) {
          // Validate and recover existing session
          if (RankingAlgorithm.validateSession(initialSession)) {
            newSession = RankingAlgorithm.recoverSession(initialSession);
          } else {
            throw new Error('Invalid session data - starting fresh');
          }
        } else {
          // Create new session
          newSession = RankingAlgorithm.initializeRanking(images);
        }

        setSession(newSession);

        // Check if already complete
        if (newSession.isComplete) {
          const rankings = RankingAlgorithm.getFinalRankings(newSession);
          onComplete(rankings);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize ranking session';
        setError(errorMessage);
        
        // Try to create a fresh session as fallback
        try {
          const fallbackSession = RankingAlgorithm.initializeRanking(images);
          setSession(fallbackSession);
          setError(null);
        } catch (fallbackErr) {
          setError('Failed to create ranking session');
        }
      } finally {
        setIsInitializing(false);
      }
    };

    if (images.length >= 2) {
      initializeSession();
    } else {
      setError('At least 2 images are required for ranking');
      setIsInitializing(false);
    }
  }, [images, initialSession, onComplete]);

  // Handle comparison choice
  const handleChoice = useCallback((winner: 'left' | 'right') => {
    if (!session) return;

    try {
      // Record the comparison
      RankingAlgorithm.recordComparison(session, winner);
      
      // Create updated session object
      const updatedSession = { ...session };
      
      // Update status message for screen readers
      const progress = RankingAlgorithm.getProgress(updatedSession);
      const remainingComparisons = progress.total - progress.completed;
      
      if (remainingComparisons > 0) {
        setStatusMessage(`Comparison completed. ${remainingComparisons} comparisons remaining.`);
      } else {
        setStatusMessage('All comparisons completed. Generating final rankings.');
      }
      
      // Save progress if callback provided
      if (onProgressSave) {
        onProgressSave(updatedSession);
      }

      // Check if ranking is complete
      if (RankingAlgorithm.isComplete(updatedSession)) {
        const rankings = RankingAlgorithm.getFinalRankings(updatedSession);
        onComplete(rankings);
      } else {
        // Update session state for next comparison
        setSession(updatedSession);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record comparison';
      setError(errorMessage);
      setStatusMessage(`Error: ${errorMessage}`);
    }
  }, [session, onProgressSave, onComplete]);

  // Handle session restart
  const handleRestart = useCallback(() => {
    try {
      const newSession = RankingAlgorithm.initializeRanking(images);
      setSession(newSession);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restart ranking session';
      setError(errorMessage);
    }
  }, [images]);

  // Loading state
  if (isInitializing) {
    return (
      <div className="ranking-interface loading" role="main" aria-label="Ranking interface">
        <div className="loading-content" ref={mainContentRef} tabIndex={-1}>
          <div className="loading-spinner" role="status" aria-label="Loading"></div>
          <h2 id="loading-title">Initializing Ranking Session</h2>
          <p aria-describedby="loading-title">Preparing your images for comparison...</p>
          <div className="sr-only" role="status" aria-live="polite">
            Initializing ranking session. Please wait while we prepare your images for comparison.
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !session) {
    return (
      <div className="ranking-interface error" role="main" aria-label="Ranking interface">
        <div className="error-content" ref={mainContentRef} tabIndex={-1}>
          <div className="error-icon" aria-hidden="true">⚠️</div>
          <h2 id="error-title">Ranking Error</h2>
          <p aria-describedby="error-title">{error || 'Failed to initialize ranking session'}</p>
          <div className="error-actions">
            <button 
              onClick={handleRestart} 
              className="restart-button"
              aria-describedby="error-title"
            >
              Start New Ranking
            </button>
          </div>
          <div className="sr-only" role="alert" aria-live="assertive">
            Error occurred: {error || 'Failed to initialize ranking session'}. You can start a new ranking session.
          </div>
        </div>
      </div>
    );
  }

  // Get current comparison
  const currentComparison = RankingAlgorithm.getNextComparison(session);
  
  if (!currentComparison) {
    return (
      <div className="ranking-interface complete" role="main" aria-label="Ranking interface">
        <div className="complete-content" ref={mainContentRef} tabIndex={-1}>
          <div className="complete-icon" aria-hidden="true">✅</div>
          <h2 id="complete-title">Ranking Complete!</h2>
          <p aria-describedby="complete-title">All comparisons have been completed.</p>
          <p>Generating your final rankings...</p>
          <div className="sr-only" role="status" aria-live="polite">
            Ranking complete! All comparisons have been completed. Generating your final rankings.
          </div>
        </div>
      </div>
    );
  }

  // Get progress information
  const progress = RankingAlgorithm.getProgress(session);

  return (
    <div className="ranking-interface active" role="main" aria-label="Ranking interface">
      <ComparisonView
        leftImage={currentComparison.leftImage}
        rightImage={currentComparison.rightImage}
        onChoice={handleChoice}
        comparisonNumber={progress.completed + 1}
        totalComparisons={progress.total}
        progress={progress.percentage}
      />
      
      {/* Live region for status announcements */}
      <div 
        ref={statusRef}
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {statusMessage}
      </div>
    </div>
  );
};

export default RankingInterface;