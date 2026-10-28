# thinking-orbs (vendored, ported to Skia)

Источник: https://github.com/Jakubantalik/thinking-orbs (`src/`)
Лицензия: MIT (см. `LICENSE`), автор Jakub Antalik.

Оригинал — React-DOM-библиотека: движок считает точки, а рисует их
`CanvasRenderingContext2D`. В React Native canvas нет, поэтому порт разрезан
ровно по шву «математика / отрисовка»:

| Файл | Что с ним |
| --- | --- |
| `engine/{braid,lattice,morph,orbits,profiles,ribbon,web,registry}.ts` | **дословно из оригинала**, ни одной правки |
| `presets.ts` | дословно |
| `engine/core.ts` | вся математика дословно; переписаны только `paint`/`paintLines` — вместо `ctx.arc`/`ctx.stroke` они складывают примитивы в `OrbSink` |
| `engine/types.ts` | `ModeDraw` принимает `OrbSink` вместо `CanvasRenderingContext2D` |
| `types.ts` | оставлены `OrbState` и `OrbSize`; пропсы компонента выкинуты — они были DOM-ные |
| `theme.ts`, `ThinkingOrb.tsx` | **не портированы**: `matchMedia`, `MutationObserver`, `IntersectionObserver`. Заменены на [`src/components/ThinkingOrb.tsx`](../../components/ThinkingOrb.tsx) |

Обновление апстрима: перекачать восемь «дословных» файлов и `presets.ts`,
`core.ts` и `types.ts` смержить руками.

## Почему движок остался на JS-потоке

Режимы — обычные функции, а не воркле́ты, и `react-native-worklets` 0.5 не умеет
воркле́тизировать файл целиком (нет директивы уровня модуля). Воркле́тизировать
каждую функцию движка = переписать апстрим, а тогда его уже не обновить.

Поэтому: кадр считается на JS-потоке, результат кладётся в `SharedValue`
плоскими массивами чисел, а UI-поток читает их и рисует. Через мост за кадр
уезжает ~5·N чисел (N — точки), объектов и строк нет.
