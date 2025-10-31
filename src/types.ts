export interface ImageData {
  path: string;
  blob: Blob;
  url: string;
}

export interface Rating {
  id: string;
  value: number; // 1-5 stars
  timestamp: number;
}

export interface ImageRating {
  imagePath: string;
  ratings: Rating[];
}

export interface RatingResults {
  [imagePath: string]: {
    ratings: number[]; // Array of rating values
    average: number; // Average of all ratings
    notes?: string; // Optional notes for the image
  };
}

export interface ProgressData {
  sessionId: string;
  timestamp: number;
  currentImageIndex: number;
  imageRatings: { [imagePath: string]: Rating[] };
  imageNotes: { [imagePath: string]: string }; // Notes for each image
  imageMetadata: {
    path: string;
    size: number;
    lastModified: number;
  }[];
  imageOrder: string[]; // Preserves the exact order of images (paths)
  zipFileName: string;
}

export interface StorageInfo {
  hasStoredProgress: boolean;
  sessionId?: string;
  timestamp?: number;
  zipFileName?: string;
  imageCount?: number;
  ratedCount?: number;
}

// Ranking Mode Types

export interface RankingResult {
  image: ImageData;
  rank: number; // 1-based ranking (1 = best)
  score: number; // Internal scoring for tie-breaking
}

export interface Comparison {
  id: string;
  leftImage: ImageData;
  rightImage: ImageData;
  leftIndex: number;
  rightIndex: number;
}

export interface ComparisonResult {
  comparisonId: string;
  winnerIndex: number;
  loserIndex: number;
  timestamp: number;
}

export interface RankingSession {
  sessionId: string;
  images: ImageData[];
  comparisons: ComparisonResult[];
  currentComparison: Comparison | null;
  isComplete: boolean;
  totalComparisons: number;
  completedComparisons: number;
}

export interface RankingProgress {
  sessionId: string;
  timestamp: number;
  zipFileName: string;
  mode: 'ranking';
  session: RankingSession;
  imageMetadata: Array<{
    path: string;
    size: number;
    lastModified: number;
  }>;
}

// App Mode Types

export type AppMode = 'rating' | 'ranking';

// Extended Progress Data

export interface ExtendedProgressData extends ProgressData {
  mode?: AppMode;
  rankingProgress?: RankingProgress;
}
