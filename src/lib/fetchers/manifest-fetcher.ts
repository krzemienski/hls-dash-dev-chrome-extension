// src/lib/fetchers/manifest-fetcher.ts

export class ManifestFetchError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'ManifestFetchError';
  }
}

/**
 * Fetch manifest content from URL
 * Adapted from: abr-manifest-viewer-chrome/background.js:92-111
 * Migration: XMLHttpRequest → fetch API (required for service workers)
 */
export async function fetchManifestContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.apple.mpegurl, application/dash+xml, */*'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new ManifestFetchError(
          'Manifest not found (404). Please check the URL.',
          404
        );
      }
      throw new ManifestFetchError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    return await response.text();
  } catch (error) {
    if (error instanceof ManifestFetchError) {
      throw error;
    }

    // Network errors (CORS, SSL, DNS, etc.)
    if (error instanceof TypeError) {
      throw new ManifestFetchError(
        'Network error. Possible causes: CORS restriction, invalid SSL certificate, or DNS failure. Try clicking the manifest URL to download directly.'
      );
    }

    throw new ManifestFetchError(
      `Failed to fetch manifest: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
