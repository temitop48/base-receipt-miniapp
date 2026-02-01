import { toPng } from 'html-to-image';

/**
 * Fixed dimensions for receipt export - ensures consistent output across all devices
 */
const EXPORT_WIDTH = 800;
const MAX_RETRIES = 3;
const RETRY_DELAY = 500;

/**
 * Waits for all fonts, images, and SVG elements to load before capturing
 */
async function waitForAssetsToLoad(element: HTMLElement): Promise<void> {
  // Wait for fonts to load
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // Wait for images to load
  const images = element.querySelectorAll('img');
  const imagePromises = Array.from(images).map((img: HTMLImageElement) => {
    if (img.complete) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      img.addEventListener('load', () => resolve());
      img.addEventListener('error', () => resolve()); // Resolve even on error to not block
      // Timeout after 5 seconds
      setTimeout(() => resolve(), 5000);
    });
  });

  await Promise.all(imagePromises);

  // Wait for SVG elements to render
  const svgs = element.querySelectorAll('svg');
  if (svgs.length > 0) {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 100));
  }

  // Extended delay to ensure all rendering is complete
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
}

/**
 * Attempts to capture the element with retries
 */
async function captureWithRetry(
  element: HTMLElement,
  width: number,
  height: number,
  retries: number = MAX_RETRIES
): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        width,
        height,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          margin: '0',
          padding: '0',
        },
        filter: (node: HTMLElement) => {
          // Exclude certain elements that might cause issues
          if (node.classList) {
            return !node.classList.contains('no-export');
          }
          return true;
        },
      });

      // Verify the data URL is valid
      if (dataUrl && dataUrl.startsWith('data:image/png')) {
        return dataUrl;
      }
      throw new Error('Invalid data URL generated');
    } catch (error) {
      if (attempt < retries - 1) {
        // Wait before retrying
        await new Promise<void>(resolve => setTimeout(() => resolve(), RETRY_DELAY * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Failed to capture image after all retries');
}

/**
 * Downloads a receipt card as a high-quality PNG image with fixed dimensions
 * @param elementId The DOM ID of the receipt element to capture
 * @param filename The name of the downloaded file (without extension)
 */
export async function downloadReceiptImage(
  elementId: string,
  filename: string
): Promise<void> {
  const element = document.getElementById(elementId);
  
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  try {
    // Ensure element is visible but off-screen
    const originalStyle = {
      opacity: element.style.opacity,
      position: element.style.position,
    };
    element.style.opacity = '1';
    element.style.position = 'absolute';

    // Wait for all assets to load
    await waitForAssetsToLoad(element);

    // Get the actual rendered height of the element
    const elementHeight = element.scrollHeight || element.offsetHeight;

    // Generate high-quality PNG with retries
    const dataUrl = await captureWithRetry(element, EXPORT_WIDTH, elementHeight);

    // Restore original styles
    element.style.opacity = originalStyle.opacity || '';
    element.style.position = originalStyle.position || '';

    // Create download link
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Error generating receipt image:', error);
    throw new Error('Failed to generate receipt image. Please try again.');
  }
}

/**
 * Generates a receipt image blob for sharing or uploading
 * @param elementId The DOM ID of the receipt element to capture
 * @returns Promise resolving to a Blob of the receipt image
 */
export async function generateReceiptImageBlob(
  elementId: string
): Promise<Blob> {
  const element = document.getElementById(elementId);
  
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  try {
    // Ensure element is visible but off-screen
    const originalStyle = {
      opacity: element.style.opacity,
      position: element.style.position,
    };
    element.style.opacity = '1';
    element.style.position = 'absolute';

    // Wait for all assets to load
    await waitForAssetsToLoad(element);

    // Get the actual rendered height of the element
    const elementHeight = element.scrollHeight || element.offsetHeight;

    // Generate high-quality PNG with retries
    const dataUrl = await captureWithRetry(element, EXPORT_WIDTH, elementHeight);

    // Restore original styles
    element.style.opacity = originalStyle.opacity || '';
    element.style.position = originalStyle.position || '';

    // Convert data URL to Blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    return blob;
  } catch (error) {
    console.error('Error generating receipt image blob:', error);
    throw new Error('Failed to generate receipt image blob');
  }
}
