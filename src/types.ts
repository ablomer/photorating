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
