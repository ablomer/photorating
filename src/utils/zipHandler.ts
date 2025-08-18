import JSZip from 'jszip';
import type { ImageData } from '../types';

const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];

export async function extractImagesFromZip(zipFile: File, shuffle: boolean = false): Promise<ImageData[]> {
  try {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(zipFile);
    const images: ImageData[] = [];

    // Iterate through all files in the zip
    for (const [relativePath, zipEntry] of Object.entries(zipContent.files)) {
      // Skip directories
      if (zipEntry.dir) continue;

      // Check if the file is an image based on extension
      const isImage = SUPPORTED_IMAGE_EXTENSIONS.some(ext => 
        relativePath.toLowerCase().endsWith(ext)
      );

      if (isImage) {
        try {
          // Get the file as a blob
          const blob = await zipEntry.async('blob');
          
          // Create object URL for display
          const url = URL.createObjectURL(blob);

          images.push({
            path: relativePath,
            blob,
            url
          });
        } catch (error) {
          console.warn(`Failed to extract image ${relativePath}:`, error);
        }
      }
    }

    // Sort images by path for consistent ordering, or shuffle if requested
    if (shuffle) {
      // Fisher-Yates shuffle algorithm
      for (let i = images.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [images[i], images[j]] = [images[j], images[i]];
      }
    } else {
      images.sort((a, b) => a.path.localeCompare(b.path));
    }

    return images;
  } catch (error) {
    console.error('Failed to extract images from zip:', error);
    throw new Error('Failed to process zip file. Please ensure it\'s a valid zip file.');
  }
}

export function cleanupImageUrls(images: ImageData[]): void {
  images.forEach(image => {
    URL.revokeObjectURL(image.url);
  });
}
