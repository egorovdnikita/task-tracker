/**
 * Эмодзи в начале имени папки.
 *
 * Референс разрешает называть проект «📦 Покупки» и показывает эмодзи вместо
 * иконки. Это стоит одного регулярного выражения и оживляет список папок
 * сильнее, чем любая палитра: цвет различает две папки, эмодзи — десять.
 *
 * `\p{Extended_Pictographic}` покрывает и составные эмодзи с модификаторами:
 * дальше идёт необязательная последовательность вариантов, тонов кожи и
 * склеек через ZWJ — без неё «👨‍💻» разъехалось бы на три символа.
 */
const LEADING_EMOJI = /^(\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|\p{Emoji_Modifier})*)\s*/u;

export const splitEmoji = (name: string): { emoji: string | null; rest: string } => {
  const match = name.match(LEADING_EMOJI);
  if (!match) return { emoji: null, rest: name };

  const rest = name.slice(match[0].length).trim();
  // Имя из одного эмодзи остаётся именем: подменять его пустой строкой значит
  // показать безымянную папку.
  return rest ? { emoji: match[1], rest } : { emoji: null, rest: name };
};
