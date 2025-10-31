import type { ImageData, RankingSession, Comparison, ComparisonResult, RankingResult } from '../types';

/**
 * Merge-sort inspired ranking algorithm that minimizes pairwise comparisons
 * Uses divide-and-conquer approach with transitivity optimization
 */
export class RankingAlgorithm {
  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Initialize a new ranking session
   */
  static initializeRanking(images: ImageData[]): RankingSession {
    if (images.length < 2) {
      throw new Error('At least 2 images are required for ranking');
    }

    const totalComparisons = this.estimateComparisons(images.length);
    
    const session: RankingSession = {
      sessionId: this.generateId(),
      images: [...images],
      comparisons: [],
      currentComparison: null,
      isComplete: false,
      totalComparisons,
      completedComparisons: 0
    };

    // Generate the first comparison
    session.currentComparison = this.generateNextComparison(session);
    
    return session;
  }

  /**
   * Estimate the number of comparisons needed using merge-sort complexity
   * Uses N * log2(N) as the upper bound with optimization factor
   */
  private static estimateComparisons(n: number): number {
    if (n <= 1) return 0;
    if (n === 2) return 1;
    
    // Use merge-sort complexity: N * log2(N) with optimization factor
    const optimizationFactor = 0.8; // Account for transitivity optimizations
    return Math.ceil(n * Math.log2(n) * optimizationFactor);
  }

  /**
   * Generate the next comparison needed for the ranking
   * Uses merge-sort approach to minimize total comparisons
   */
  private static generateNextComparison(session: RankingSession): Comparison | null {
    if (session.isComplete) {
      return null;
    }

    const { images, comparisons } = session;

    // Build comparison matrix to track what we know
    const comparisonMatrix = this.buildComparisonMatrix(images, comparisons);
    
    // Find the next most valuable comparison using merge-sort strategy
    const nextPair = this.findNextComparisonPair(comparisonMatrix, images);
    
    if (!nextPair) {
      // No more comparisons needed
      return null;
    }

    const [leftIndex, rightIndex] = nextPair;
    
    return {
      id: this.generateId(),
      leftImage: images[leftIndex],
      rightImage: images[rightIndex],
      leftIndex,
      rightIndex
    };
  }

  /**
   * Build a matrix tracking comparison results and inferred relationships
   */
  private static buildComparisonMatrix(images: ImageData[], comparisons: ComparisonResult[]): number[][] {
    const n = images.length;
    // Matrix: 0 = unknown, 1 = left > right, -1 = left < right
    const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
    
    // Fill diagonal (image compared to itself)
    for (let i = 0; i < n; i++) {
      matrix[i][i] = 0;
    }

    // Add direct comparisons
    for (const comparison of comparisons) {
      const { winnerIndex, loserIndex } = comparison;
      matrix[winnerIndex][loserIndex] = 1;  // winner > loser
      matrix[loserIndex][winnerIndex] = -1; // loser < winner
    }

    // Apply transitivity to infer additional relationships
    this.applyTransitivity(matrix);
    
    return matrix;
  }

  /**
   * Apply transitivity rules to infer relationships
   * If A > B and B > C, then A > C
   */
  private static applyTransitivity(matrix: number[][]): void {
    const n = matrix.length;
    let changed = true;
    
    // Keep applying transitivity until no new relationships are found
    while (changed) {
      changed = false;
      
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i === j || matrix[i][j] !== 0) continue;
          
          // Look for transitivity: i > k > j or i < k < j
          for (let k = 0; k < n; k++) {
            if (k === i || k === j) continue;
            
            // If i > k and k > j, then i > j
            if (matrix[i][k] === 1 && matrix[k][j] === 1) {
              matrix[i][j] = 1;
              matrix[j][i] = -1;
              changed = true;
              break;
            }
            
            // If i < k and k < j, then i < j
            if (matrix[i][k] === -1 && matrix[k][j] === -1) {
              matrix[i][j] = -1;
              matrix[j][i] = 1;
              changed = true;
              break;
            }
          }
        }
      }
    }
  }

  /**
   * Find the next most valuable comparison pair using merge-sort strategy
   */
  private static findNextComparisonPair(matrix: number[][], images: ImageData[]): [number, number] | null {
    const n = images.length;
    
    // Strategy: Find pairs that would help divide the set most effectively
    // Prioritize comparisons that help establish order in the middle ranges
    
    for (let groupSize = 2; groupSize <= n; groupSize *= 2) {
      for (let start = 0; start < n; start += groupSize) {
        const mid = Math.min(start + Math.floor(groupSize / 2), n);
        const end = Math.min(start + groupSize, n);
        
        if (mid >= end) continue;
        
        // Find comparisons needed to merge these groups
        for (let i = start; i < mid; i++) {
          for (let j = mid; j < end; j++) {
            if (matrix[i][j] === 0) {
              return [i, j];
            }
          }
        }
      }
    }
    
    // Fallback: find any unknown comparison
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (matrix[i][j] === 0) {
          return [i, j];
        }
      }
    }
    
    return null;
  }

  /**
   * Get the next comparison for the session
   */
  static getNextComparison(session: RankingSession): Comparison | null {
    return session.currentComparison;
  }

  /**
   * Record a comparison result and update session state
   */
  static recordComparison(session: RankingSession, winner: 'left' | 'right'): void {
    const currentComparison = session.currentComparison;
    if (!currentComparison) {
      throw new Error('No active comparison to record');
    }

    const winnerIndex = winner === 'left' ? currentComparison.leftIndex : currentComparison.rightIndex;
    const loserIndex = winner === 'left' ? currentComparison.rightIndex : currentComparison.leftIndex;

    // Validate the comparison hasn't been recorded already
    const existingComparison = session.comparisons.find(c => 
      (c.winnerIndex === winnerIndex && c.loserIndex === loserIndex) ||
      (c.winnerIndex === loserIndex && c.loserIndex === winnerIndex)
    );

    if (existingComparison) {
      throw new Error('This comparison has already been recorded');
    }

    // Record the comparison result
    const comparisonResult: ComparisonResult = {
      comparisonId: currentComparison.id,
      winnerIndex,
      loserIndex,
      timestamp: Date.now()
    };

    session.comparisons.push(comparisonResult);
    session.completedComparisons++;

    // Update session state and check for completion
    this.updateSessionState(session);
  }

  /**
   * Update session state after recording a comparison
   * Determines if ranking is complete and generates next comparison
   */
  private static updateSessionState(session: RankingSession): void {
    // Check if we can determine complete ranking with current comparisons
    if (this.canDetermineCompleteRanking(session)) {
      session.isComplete = true;
      session.currentComparison = null;
      return;
    }

    // Generate next comparison
    session.currentComparison = this.generateNextComparison(session);
    
    // If no more comparisons can be generated, ranking is complete
    if (!session.currentComparison) {
      session.isComplete = true;
    }
  }

  /**
   * Check if we can determine a complete ranking with current comparisons
   * Uses transitivity to determine if all relationships are known
   */
  private static canDetermineCompleteRanking(session: RankingSession): boolean {
    const { images, comparisons } = session;
    const n = images.length;

    // Build comparison matrix with transitivity
    const matrix = this.buildComparisonMatrix(images, comparisons);
    
    // Check if we can rank all images (all pairs have known relationships)
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (matrix[i][j] === 0) {
          return false; // Still have unknown relationships
        }
      }
    }
    
    return true;
  }

  /**
   * Get detailed session state information
   */
  static getSessionState(session: RankingSession): {
    isComplete: boolean;
    progress: { completed: number; total: number; percentage: number };
    currentComparison: Comparison | null;
    canDetermineRanking: boolean;
    estimatedRemainingComparisons: number;
  } {
    const progress = this.getProgress(session);
    const canDetermineRanking = session.comparisons.length > 0 ? 
      this.canDetermineCompleteRanking(session) : false;
    
    // Estimate remaining comparisons based on current state
    const estimatedRemainingComparisons = session.isComplete ? 0 : 
      Math.max(0, this.estimateRemainingComparisons(session));

    return {
      isComplete: session.isComplete,
      progress,
      currentComparison: session.currentComparison,
      canDetermineRanking,
      estimatedRemainingComparisons
    };
  }

  /**
   * Estimate how many more comparisons are needed
   */
  private static estimateRemainingComparisons(session: RankingSession): number {
    const { images, comparisons } = session;
    const n = images.length;
    
    // Build matrix to see how many relationships we know
    const matrix = this.buildComparisonMatrix(images, comparisons);
    
    let unknownPairs = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (matrix[i][j] === 0) {
          unknownPairs++;
        }
      }
    }
    
    // Estimate based on transitivity optimization
    // Not all unknown pairs need direct comparison
    return Math.ceil(unknownPairs * 0.6); // Transitivity reduces needed comparisons
  }

  /**
   * Check if the ranking session is complete
   */
  static isComplete(session: RankingSession): boolean {
    return session.isComplete;
  }

  /**
   * Calculate final rankings from comparison results
   */
  static getFinalRankings(session: RankingSession): RankingResult[] {
    if (!session.isComplete) {
      throw new Error('Cannot generate final rankings for incomplete session');
    }

    const { images, comparisons } = session;
    const n = images.length;

    // Build final comparison matrix
    const matrix = this.buildComparisonMatrix(images, comparisons);
    
    // Calculate scores for each image based on wins
    const scores: number[] = Array(n).fill(0);
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j && matrix[i][j] === 1) {
          scores[i]++; // Count wins
        }
      }
    }

    // Create ranking results
    const results: RankingResult[] = images.map((image, index) => ({
      image,
      rank: 0, // Will be set below
      score: scores[index]
    }));

    // Sort by score (descending) and assign ranks
    results.sort((a, b) => b.score - a.score);
    
    // Assign ranks (handle ties by giving same rank)
    let currentRank = 1;
    for (let i = 0; i < results.length; i++) {
      if (i > 0 && results[i].score < results[i - 1].score) {
        currentRank = i + 1;
      }
      results[i].rank = currentRank;
    }

    return results;
  }

  /**
   * Get progress information for the session
   */
  static getProgress(session: RankingSession): { completed: number; total: number; percentage: number } {
    return {
      completed: session.completedComparisons,
      total: session.totalComparisons,
      percentage: Math.round((session.completedComparisons / session.totalComparisons) * 100)
    };
  }

  /**
   * Validate session state and attempt recovery if needed
   */
  static validateSession(session: RankingSession): boolean {
    try {
      // Check basic structure
      if (!session.sessionId || !Array.isArray(session.images) || !Array.isArray(session.comparisons)) {
        return false;
      }

      // Validate comparisons reference valid image indices
      for (const comparison of session.comparisons) {
        if (comparison.winnerIndex >= session.images.length || 
            comparison.loserIndex >= session.images.length ||
            comparison.winnerIndex < 0 || 
            comparison.loserIndex < 0) {
          return false;
        }
      }

      // Validate current comparison if exists
      if (session.currentComparison) {
        const { leftIndex, rightIndex } = session.currentComparison;
        if (leftIndex >= session.images.length || 
            rightIndex >= session.images.length ||
            leftIndex < 0 || 
            rightIndex < 0) {
          return false;
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Recover session state by regenerating current comparison and updating completion status
   */
  static recoverSession(session: RankingSession): RankingSession {
    if (!this.validateSession(session)) {
      throw new Error('Cannot recover invalid session');
    }

    // Create a new session object to avoid mutations
    const recoveredSession: RankingSession = {
      ...session,
      comparisons: [...session.comparisons]
    };

    // Recalculate completion status
    if (this.canDetermineCompleteRanking(recoveredSession)) {
      recoveredSession.isComplete = true;
      recoveredSession.currentComparison = null;
    } else {
      recoveredSession.isComplete = false;
      recoveredSession.currentComparison = this.generateNextComparison(recoveredSession);
    }

    // Update completed comparisons count
    recoveredSession.completedComparisons = recoveredSession.comparisons.length;

    return recoveredSession;
  }

  /**
   * Get comparison history and statistics
   */
  static getComparisonHistory(session: RankingSession): {
    totalComparisons: number;
    completedComparisons: number;
    comparisonResults: ComparisonResult[];
    averageComparisonTime: number;
    transitivityOptimizations: number;
  } {
    const { comparisons } = session;
    
    // Calculate average time between comparisons
    let totalTime = 0;
    let timeCount = 0;
    
    for (let i = 1; i < comparisons.length; i++) {
      const timeDiff = comparisons[i].timestamp - comparisons[i - 1].timestamp;
      if (timeDiff > 0 && timeDiff < 300000) { // Ignore gaps > 5 minutes
        totalTime += timeDiff;
        timeCount++;
      }
    }
    
    const averageComparisonTime = timeCount > 0 ? totalTime / timeCount : 0;
    
    // Estimate transitivity optimizations by comparing actual vs theoretical comparisons
    const n = session.images.length;
    const theoreticalComparisons = n * (n - 1) / 2; // All possible pairs
    const actualComparisons = comparisons.length;
    const transitivityOptimizations = Math.max(0, theoreticalComparisons - actualComparisons);

    return {
      totalComparisons: session.totalComparisons,
      completedComparisons: session.completedComparisons,
      comparisonResults: [...comparisons],
      averageComparisonTime,
      transitivityOptimizations
    };
  }

  /**
   * Check for inconsistencies in comparison results (circular preferences)
   */
  static detectInconsistencies(session: RankingSession): {
    hasInconsistencies: boolean;
    inconsistentTriples: Array<[number, number, number]>;
    suggestions: string[];
  } {
    const { images, comparisons } = session;
    const n = images.length;
    const matrix = Array(n).fill(null).map(() => Array(n).fill(0));
    
    // Fill matrix with direct comparisons only (no transitivity)
    for (const comparison of comparisons) {
      const { winnerIndex, loserIndex } = comparison;
      matrix[winnerIndex][loserIndex] = 1;
      matrix[loserIndex][winnerIndex] = -1;
    }
    
    const inconsistentTriples: Array<[number, number, number]> = [];
    
    // Look for circular preferences: A > B > C > A
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          if (i !== j && j !== k && k !== i) {
            // Check if i > j > k > i (circular)
            if (matrix[i][j] === 1 && matrix[j][k] === 1 && matrix[k][i] === 1) {
              inconsistentTriples.push([i, j, k]);
            }
          }
        }
      }
    }
    
    const suggestions: string[] = [];
    if (inconsistentTriples.length > 0) {
      suggestions.push('Consider reviewing recent comparisons for consistency');
      suggestions.push('Some preferences may form circular relationships');
    }
    
    return {
      hasInconsistencies: inconsistentTriples.length > 0,
      inconsistentTriples,
      suggestions
    };
  }

  /**
   * Reset session to a previous state (undo comparisons)
   */
  static resetToComparison(session: RankingSession, targetComparisonCount: number): RankingSession {
    if (targetComparisonCount < 0 || targetComparisonCount > session.comparisons.length) {
      throw new Error('Invalid target comparison count');
    }
    
    const resetSession: RankingSession = {
      ...session,
      comparisons: session.comparisons.slice(0, targetComparisonCount),
      completedComparisons: targetComparisonCount,
      isComplete: false
    };
    
    // Regenerate current comparison
    resetSession.currentComparison = this.generateNextComparison(resetSession);
    
    // Check if still complete after reset
    if (!resetSession.currentComparison) {
      resetSession.isComplete = true;
    }
    
    return resetSession;
  }
}