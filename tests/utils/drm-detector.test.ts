// tests/utils/drm-detector.test.ts
import { describe, it, expect } from 'vitest';
import {
  detectDRM,
  analyzeDRMSystems,
  getDRMInfo
} from '../../src/lib/utils/drm-detector';

describe('detectDRM', () => {
  it('should detect Widevine DRM in HLS', () => {
    const content = '#EXTM3U\n#EXT-X-KEY:METHOD=SAMPLE-AES,URI="skd://widevine"';
    const result = detectDRM(content, 'hls');

    expect(result.isEncrypted).toBe(true);
    expect(result.systems).toContain('Widevine');
  });

  it('should detect FairPlay DRM in HLS', () => {
    const content = '#EXTM3U\n#EXT-X-KEY:METHOD=SAMPLE-AES,URI="skd://fairplay"';
    const result = detectDRM(content, 'hls');

    expect(result.isEncrypted).toBe(true);
    expect(result.systems).toContain('FairPlay');
  });

  it('should detect PlayReady in DASH', () => {
    const content = '<MPD><ContentProtection schemeIdUri="urn:uuid:9a04f079-9840-4286-ab92-e65be0885f95" /></MPD>';
    const result = detectDRM(content, 'dash');

    expect(result.isEncrypted).toBe(true);
    expect(result.systems).toContain('PlayReady');
  });

  it('should detect Widevine in DASH', () => {
    const content = '<MPD><ContentProtection schemeIdUri="urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed" /></MPD>';
    const result = detectDRM(content, 'dash');

    expect(result.isEncrypted).toBe(true);
    expect(result.systems).toContain('Widevine');
  });

  it('should detect no DRM for unencrypted content', () => {
    const content = '#EXTM3U\n#EXT-X-VERSION:3';
    const result = detectDRM(content, 'hls');

    expect(result.isEncrypted).toBe(false);
    expect(result.systems).toHaveLength(0);
  });
});

describe('analyzeDRMSystems', () => {
  it('should provide details for Widevine', () => {
    const systems = analyzeDRMSystems(['Widevine']);

    expect(systems).toHaveLength(1);
    expect(systems[0].name).toBe('Widevine');
    expect(systems[0].vendor).toBe('Google');
    expect(systems[0].platforms).toContain('Android');
  });

  it('should provide details for FairPlay', () => {
    const systems = analyzeDRMSystems(['FairPlay']);

    expect(systems).toHaveLength(1);
    expect(systems[0].name).toBe('FairPlay');
    expect(systems[0].vendor).toBe('Apple');
    expect(systems[0].platforms).toContain('iOS');
  });

  it('should provide details for PlayReady', () => {
    const systems = analyzeDRMSystems(['PlayReady']);

    expect(systems).toHaveLength(1);
    expect(systems[0].name).toBe('PlayReady');
    expect(systems[0].vendor).toBe('Microsoft');
  });

  it('should handle multiple DRM systems', () => {
    const systems = analyzeDRMSystems(['Widevine', 'PlayReady', 'FairPlay']);

    expect(systems).toHaveLength(3);
  });
});

describe('getDRMInfo', () => {
  it('should return DRM system information', () => {
    const info = getDRMInfo('Widevine');

    expect(info.name).toBe('Widevine');
    expect(info.level).toBe('L1/L2/L3');
    expect(info.description).toContain('Google');
  });

  it('should return information for FairPlay', () => {
    const info = getDRMInfo('FairPlay');

    expect(info.name).toBe('FairPlay');
    expect(info.vendor).toBe('Apple');
  });

  it('should return information for PlayReady', () => {
    const info = getDRMInfo('PlayReady');

    expect(info.name).toBe('PlayReady');
    expect(info.vendor).toBe('Microsoft');
  });
});
