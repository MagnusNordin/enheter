import { useCallback, useState } from 'react';
import {
  loadSettings,
  normalizeSettings,
  saveSettings,
  type Settings,
} from '../storage/settings.ts';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      const next = normalizeSettings({ ...settings, ...patch });
      setSettings(next);
      saveSettings(next);
    },
    [settings],
  );

  return { settings, updateSettings };
}
