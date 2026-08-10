# Task Tracker Notes

Простое мобильное приложение для ведения заметок: список с тегами и поиском, редактор
с цветовыми метками и закреплением, настройки с тёмной темой и сортировкой. Всё данные
хранятся локально на устройстве.

Приложение и витрина компонентов собраны **из одного набора исходников**: компоненты написаны
на примитивах React Native и рендерятся в Storybook через `react-native-web`. Правка компонента
одновременно меняет и приложение, и документацию.

📚 **Storybook:** https://egorovdnikita.github.io/task-tracker/ (деплоится автоматически из `main`)

---

## Стек технологий

| Слой | Технологии |
| --- | --- |
| Язык | TypeScript 6 (strict) |
| Мобильный рантайм | React Native 0.86, React 19.2, Expo SDK 57 (managed workflow), Metro |
| Навигация | React Navigation 7 (`@react-navigation/native`, `native-stack`), `react-native-screens`, `react-native-safe-area-context` |
| Состояние | Zustand 5 + middleware `persist` |
| Хранилище | `@react-native-async-storage/async-storage` (локально на устройстве) |
| UI | Собственная дизайн-система на токенах: `StyleSheet`, `ThemeProvider` (светлая/тёмная схема), без UI-китов и иконочных библиотек |
| Витрина компонентов | Storybook 10 (`@storybook/react-vite`), аддоны `addon-docs`, `addon-a11y` |
| Сборка витрины | Vite 8 + `@vitejs/plugin-react`, алиас `react-native` → `react-native-web` 0.21 |
| Веб-версия приложения | `react-native-web` + `react-dom` (`npm run web`) |
| CI/CD | GitHub Actions → GitHub Pages (typecheck + сборка Storybook на каждый push в `main`) |

## Экраны

Реализованы по wireframe, каждый экран есть в Storybook в разделе **Экраны**.

| Экран | Что делает |
| --- | --- |
| **S1 · Notes List** | Список заметок, счётчик, фильтр по тегам, заглушка поиска, FAB создания |
| **S2 · Note Editor** | Создание и правка: заголовок, текст, тег, цвет, закрепление, удаление |
| **S3 · Search** | Поиск по заголовку, тексту и тегу с подсветкой совпадений |
| **S4 · Settings** | Тёмная тема, компактный список, сортировка, удаление всех заметок |
| **S5 · Confirm Sheet** | Нижний шит подтверждения (удалить / открепить) |

## Структура проекта

```
src/
  components/     переиспользуемые компоненты + их *.stories.tsx
  screens/        экраны S1–S4 — чистые презентационные компоненты + сторис
  navigation/     RootNavigator: связывает экраны со стором и React Navigation
  store/          Zustand-стор заметок и настроек, селекторы поиска/сортировки
  theme/          дизайн-токены и ThemeProvider
  mocks/          фикстуры для Storybook
  utils/          форматирование дат, склонения
.storybook/       конфигурация Storybook (vite + react-native-web)
.github/workflows деплой Storybook на GitHub Pages
```

Экраны не знают про навигацию и стор — они получают данные и колбэки пропсами.
Благодаря этому один и тот же экран рендерится и в приложении, и в Storybook.

## Запуск

```bash
npm install
```

Мобильное приложение (Expo Go / симулятор):

```bash
npm start
```

```bash
npm run ios
```

```bash
npm run android
```

Веб-версия приложения:

```bash
npm run web
```

Storybook локально:

```bash
npm run storybook
```

Статическая сборка Storybook:

```bash
npm run build-storybook
```

Проверка типов:

```bash
npm run typecheck
```

## Как добавить компонент

1. Создать `src/components/MyThing.tsx` на примитивах React Native (никаких web-only API).
2. Рядом положить `MyThing.stories.tsx` со всеми состояниями.
3. Экспортировать из `src/components/index.ts`.
4. Push в `main` — GitHub Actions пересоберёт Storybook и обновит GitHub Pages.

## Лицензия

MIT — см. [LICENSE](LICENSE).
