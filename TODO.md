# TODO

## 1. ~~CI: добавить тесты и линтер в workflow~~ ✅
## 2. ~~Закоммитить изменения~~ ✅

## 3. Тесты для App.tsx

`src/App.tsx` плотно завязан на singletons из `@tma.js/sdk-react` (`miniApp`,
`themeParams`, `mainButton`, `hapticFeedback`, `useLaunchParams`, `useSignal`).

Подход: `vi.mock("@tma.js/sdk-react", ...)` с мок-реализациями:

- `miniApp.mount/unmount/ready` — заглушки
- `themeParams.mount/unmount/bindCssVars` — заглушки
- `mainButton.mount/unmount/setText/show/hide/onClick` — заглушки
- `hapticFeedback.impactOccurred/notificationOccurred` — заглушки
- `useLaunchParams` — возврат тестовых данных
- `useSignal` — возврат тестовых значений

Сценарии:
- Рендер с мок-данными пользователя (имя, username, ID, platform)
- Рендер с отсутствующим пользователем (показ «—»)
- Клик по MainButton вызывает haptic feedback
- Клик по кнопке «Haptic feedback» вызывает impactOccurred

## 4. (опционально) Coverage пороги

Добавить в `vitest.config.ts`:

```ts
coverage: {
  provider: "v8",
  include: ["src/**/*.{ts,tsx}"],
  exclude: ["src/**/*.test.*", "src/test-setup.ts", "src/vite-env.d.ts"],
}
```

Пороги: `lines: 80, functions: 80, branches: 75, statements: 80`.
