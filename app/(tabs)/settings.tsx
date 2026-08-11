import React from 'react';

import { SettingsScreen } from '../../src/screens/SettingsScreen';
import { useNotesStore } from '../../src/store/useNotesStore';
import { confirmDestructive } from '../../src/utils/confirm';

/** S4 — настройки. Вкладка «Ещё». */
export default function SettingsRoute() {
  const settings = useNotesStore((s) => s.settings);
  const updateSettings = useNotesStore((s) => s.updateSettings);
  const clearAll = useNotesStore((s) => s.clearAll);

  return (
    <SettingsScreen
      settings={settings}
      onChange={updateSettings}
      onClearAll={() =>
        confirmDestructive('Удалить все заметки?', 'Действие необратимо.', clearAll)
      }
    />
  );
}
