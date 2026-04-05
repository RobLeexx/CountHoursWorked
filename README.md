# WorkaHoric
## Count Hours Worked

A clean React Native starter built with Expo, Expo Router, and TypeScript.

## Stack

- Expo SDK 54
- React Native
- TypeScript
- Expo Router
- ESLint
- Prettier
- Atomic Design-inspired UI structure

## Folder tree

```text
.
|-- app.json
|-- eslint.config.js
|-- expo-env.d.ts
|-- package.json
|-- tsconfig.json
`-- src
    |-- api
    |   |-- client.ts
    |   `-- index.ts
    |-- app
    |   |-- +not-found.tsx
    |   |-- _layout.tsx
    |   `-- (main)
    |       |-- _layout.tsx
    |       |-- demo.tsx
    |       `-- index.tsx
    |-- assets
    |   `-- README.md
    |-- components
    |   |-- atoms
    |   |   |-- AppButton.tsx
    |   |   |-- AppInput.tsx
    |   |   |-- AppText.tsx
    |   |   `-- index.ts
    |   |-- molecules
    |   |   |-- FormField.tsx
    |   |   `-- index.ts
    |   |-- organisms
    |   |   |-- Header.tsx
    |   |   `-- index.ts
    |   |-- templates
    |   |   |-- MainLayout.tsx
    |   |   `-- index.ts
    |   `-- index.ts
    |-- constants
    |   |-- app.ts
    |   |-- index.ts
    |   `-- routes.ts
    |-- context
    |   |-- AppContext.tsx
    |   `-- index.ts
    |-- features
    |   `-- demo
    |       |-- components
    |       |   `-- ExamplePostCard.tsx
    |       |-- hooks
    |       |   `-- useExamplePost.ts
    |       `-- index.ts
    |-- hooks
    |   |-- index.ts
    |   |-- useDebounce.ts
    |   `-- useToggle.ts
    |-- screens
    |   |-- DemoScreen.tsx
    |   |-- HomeScreen.tsx
    |   `-- index.ts
    |-- services
    |   |-- example
    |   |   `-- exampleService.ts
    |   `-- index.ts
    |-- theme
    |   |-- index.ts
    |   |-- tokens.ts
    |   `-- useAppTheme.ts
    |-- types
    |   |-- api.ts
    |   |-- app.ts
    |   |-- example.ts
    |   `-- index.ts
    `-- utils
        |-- formatters.ts
        |-- index.ts
        `-- validators.ts
```

## Architecture notes

- `src/app`: Expo Router entry points and route groups.
- `src/components`: Reusable UI built with Atomic Design layers.
- `src/screens`: Screen composition separated from file-based routes.
- `src/features`: Feature-specific UI and hooks.
- `src/context`: Global state starter using React Context.
- `src/api` and `src/services`: Shared HTTP client plus domain services.
- `src/theme`: Theme tokens and the theme hook.
- `src/constants`, `src/utils`, `src/types`: Shared app primitives.
- `src/assets`: Static resources such as images, fonts, and icons.

## Installation

```bash
npm install
npx expo start
```

## Useful commands

```bash
npm run android
npm run ios
npm run web
npm run lint
npm run lint:fix
npm run typecheck
npm run format
```

## Future improvements

- Add environment variable management for multiple backends.
- Add tests with Jest and React Native Testing Library.
- Persist theme and session state with secure storage.
- Add CI for linting, type-checking, and production builds.
