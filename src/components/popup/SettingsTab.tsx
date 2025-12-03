// src/components/popup/SettingsTab.tsx
import { useState, useEffect } from 'react';
import type { ExtensionSettings } from '../../types/messages';
import { getSettings, updateSettings } from '../../lib/utils/storage';

export function SettingsTab() {
  const [settings, setSettings] = useState<ExtensionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const currentSettings = await getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      await updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  if (loading || !settings) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-semibold text-gray-900 mb-3">Extension Settings</h3>

      {/* Auto-Intercept */}
      <div className="flex items-center justify-between py-2">
        <div>
          <div className="text-sm font-medium text-gray-900">
            Auto-detect manifests
          </div>
          <div className="text-xs text-gray-500">
            Automatically scan pages for HLS/DASH URLs
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.autoInterceptEnabled}
            onChange={(e) =>
              setSettings({ ...settings, autoInterceptEnabled: e.target.checked })
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Theme */}
      <div className="py-2">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Theme
        </label>
        <select
          value={settings.theme}
          onChange={(e) =>
            setSettings({ ...settings, theme: e.target.value as any })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto (System)</option>
        </select>
      </div>

      {/* Default View */}
      <div className="py-2">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Default View
        </label>
        <select
          value={settings.defaultView}
          onChange={(e) =>
            setSettings({ ...settings, defaultView: e.target.value as any })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="raw">Raw</option>
          <option value="structured">Structured</option>
          <option value="timeline">Timeline</option>
        </select>
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          className={`w-full px-4 py-2 rounded font-medium transition-colors ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {saved ? '✓ Saved' : 'Save Settings'}
        </button>
      </div>

      {/* Extension Info */}
      <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
        <div>HLS + DASH Manifest Viewer Pro</div>
        <div className="mt-1">Version 1.0.0</div>
      </div>
    </div>
  );
}
