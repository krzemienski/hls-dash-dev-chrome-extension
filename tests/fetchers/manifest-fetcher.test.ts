// tests/fetchers/manifest-fetcher.test.ts
import { describe, it, expect, vi } from 'vitest';
import { fetchManifestContent, ManifestFetchError } from '../../src/lib/fetchers/manifest-fetcher';

describe('fetchManifestContent', () => {
  it('should throw ManifestFetchError for 404 responses', async () => {
    // Mock fetch to return 404
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    await expect(fetchManifestContent('https://example.com/404.m3u8'))
      .rejects.toThrow(ManifestFetchError);
  });

  it('should include helpful message for SSL errors', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(fetchManifestContent('https://badssl.com/manifest.m3u8'))
      .rejects.toThrow('Network error');
  });
});
