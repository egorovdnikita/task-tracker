import React, { useMemo, useState } from 'react';
import { router } from 'expo-router';

import { SearchScreen } from '../../src/screens/SearchScreen';
import { searchNotes, useNotesStore } from '../../src/store/useNotesStore';

/** S3 — поиск. Вкладка, поэтому кнопки «назад» у экрана нет. */
export default function SearchRoute() {
  const notes = useNotesStore((s) => s.notes);
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchNotes(notes, query), [notes, query]);

  return (
    <SearchScreen
      query={query}
      results={results}
      onChangeQuery={setQuery}
      onOpenNote={(noteId) => router.push({ pathname: '/editor', params: { noteId } })}
    />
  );
}
