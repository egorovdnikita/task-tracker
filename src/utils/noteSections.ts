/** Закреплённые карточки всегда полноширинные, сетка применяется к остальным. */
export const noteSections = <T extends { pinned: boolean }>(notes: T[], columns: number): { title: string | null; data: T[][] }[] => {
  if (!notes.length) return [];
  const pinned = notes.filter(note => note.pinned);
  const rest = notes.filter(note => !note.pinned);
  const rows: T[][] = [];
  for (let i = 0; i < rest.length; i += Math.max(1, columns)) rows.push(rest.slice(i, i + Math.max(1, columns)));
  return pinned.length ? [{ title: 'Закреплено', data: pinned.map(note => [note]) }, { title: 'Остальные заметки', data: rows }] : [{ title: null, data: rows }];
};
