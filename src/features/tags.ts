import type { SFSymbol } from 'sf-symbols-typescript';

import type { AccentName } from '../theme';

/**
 * Теги приложения — три, и они заданы заранее.
 *
 * Свободный тег выглядел свободой, а был работой: чтобы отфильтровать список,
 * его сначала надо было придумать, набрать без опечатки и повторить точно так
 * же в следующий раз. На двадцатой заметке набор расползался — «работа»,
 * «Работа», «раб» — и фильтр переставал что-либо собирать.
 *
 * Три фиксированных признака закрывают то, ради чего тег заводят: срочное,
 * рабочее, личное. Их можно поставить одним касанием, они одинаково выглядят
 * во всех местах приложения и помещаются в сегмент-контрол вместе с «Все» —
 * то есть весь фильтр виден целиком, без прокрутки и без вспоминания.
 *
 * Заметки, у которых остались теги из прежних версий, их не теряют: тег
 * остаётся в `note.tags` и показывается на карточке. Фильтром доступны эти
 * три.
 */
export type StaticTag = {
  id: string;
  label: string;
  icon: SFSymbol;
  accent: AccentName;
};

export const STATIC_TAGS: StaticTag[] = [
  { id: 'важное', label: 'Важное', icon: 'exclamationmark', accent: 'red' },
  { id: 'работа', label: 'Работа', icon: 'briefcase', accent: 'blue' },
  { id: 'личное', label: 'Личное', icon: 'heart', accent: 'pink' },
];

export const staticTag = (id: string): StaticTag | undefined =>
  STATIC_TAGS.find((tag) => tag.id === id);

/** Подпись тега: для своего — заданная, для унаследованного — он сам. */
export const tagLabel = (id: string): string => staticTag(id)?.label ?? id;
