# WorkaHoric

Mobile worked-hours tracker built with Expo, React Native, and TypeScript.

This project was designed as a clean, production-minded foundation for tracking worked hours across multiple projects, calculating earnings, and projecting expected monthly income from configurable weekly schedules.

## Product Overview

WorkaHoric helps hourly workers, freelancers, and project-based teams answer three practical questions:

1. How many hours did I work today?
2. How much have I earned this week and this month?
3. Based on my usual weekly schedule, how much should I still earn this month?

The app currently includes:

- Calendar-based daily hour logging
- Multi-project management
- Per-project hourly rate and currency
- Holiday marking
- Monthly projection logic based on weekly estimations
- Local persistence with AsyncStorage
- Light/Dark theme support
- English/Spanish settings
- Sidebar navigation for app sections

## Why This Project Matters

From a recruiter or hiring-manager perspective, this app demonstrates:

- Product thinking around a real-world workflow
- Clean React Native architecture without unnecessary complexity
- Typed domain modeling in TypeScript
- Reusable UI composition with scalable component layers
- Persistent local state management using React Context
- Practical business logic for dates, earnings, and projections
- Mobile-ready navigation and EAS build preparation

## Tech Stack

- Expo SDK 54
- React Native
- TypeScript
- Expo Router
- React Context
- AsyncStorage
- Expo Document Picker
- React Native DateTimePicker
- ESLint
- Prettier

## Main Features

### Home

- Monthly calendar view
- Day selection
- Daily hour editing by project
- Holiday marking
- Daily, weekly, and monthly earnings summary

### Manage Projects

- Create, edit, and delete projects
- Contract type and start date
- Per-project currency
- Contract upload support for images and PDF files
- Optional weekly estimation inside a collapsed accordion

### Projections

- Calculates estimated earnings for the current month
- Uses project weekly estimations
- Ignores holidays
- Ignores already logged hours for the same day/project
- Respects project start date
- Groups totals by currency

### Settings

- Language: English / Spanish
- Theme: Light / Dark
- Week start: Monday / Sunday
- Reset local data

### Navigation

- Sidebar with:
  - Home
  - Manage Projects
  - Projections
  - Conversions

## Business Logic Highlights

### Worked Hours

Each work log stores:

- `date`
- `hoursWorked`
- `projectId`

Earnings are calculated with:

```ts
earnings = hoursWorked * hourlyRate
```

### Projected Earnings

Each project can optionally define an estimated weekly schedule:

- `monHours`
- `tueHours`
- `wedHours`
- `thuHours`
- `friHours`
- `satHours`
- `sunHours`

The monthly projection:

- iterates through the current month
- checks the expected hours for each weekday
- skips holidays
- skips dates before the project start date
- subtracts hours already logged for that project/day
- multiplies remaining hours by the project hourly rate

This makes the projection useful as a "missing expected earnings" estimate instead of a naive future-only total.

## Architecture

The codebase is intentionally simple and modular.

```text
src/
  app/            Expo Router routes and layouts
  assets/         Static assets and icons
  components/     Reusable UI split by Atomic Design-inspired layers
  constants/      Global routes and app constants
  context/        Global app state and persistence
  hooks/          Domain and reusable hooks
  i18n/           Lightweight translation system
  screens/        Route-agnostic screen composition
  theme/          Tokens and theme hook
  types/          Domain and app-wide TypeScript models
  utils/          Date, formatter, validation, earnings, and projection helpers
```

### Architectural Decisions

- `Expo Router` is used for screen structure and navigation.
- `React Context` keeps state centralized without introducing heavier libraries.
- Business logic is extracted into `utils/` instead of being embedded in screens.
- Screens orchestrate data and UI, while reusable components remain presentation-focused.
- Project-level currency avoids incorrect aggregation when clients pay in different currencies.

## Key Screens

- `HomeScreen`: calendar, daily logs, holiday toggle, earnings summary
- `ProjectsScreen`: project CRUD and weekly estimations
- `ProjectionsScreen`: projected monthly earnings
- `SettingsScreen`: preferences and reset actions

## UI Structure

The UI follows an Atomic Design-inspired structure:

- `atoms`: basic primitives such as buttons, text, and inputs
- `molecules`: grouped form-oriented building blocks
- `organisms`: larger app sections such as calendar, summary, header, sidebar, and project manager
- `templates`: shared layout wrappers

## Persistence

Data is stored locally with AsyncStorage.

Persisted items include:

- theme mode
- language
- week start preference
- projects
- work logs
- holidays

This makes the app usable across sessions without needing a backend.

## Internationalization

The app uses a lightweight internal i18n system with:

- centralized translation objects
- translation keys like `t("settings.language")`
- English and Spanish support

This keeps bundle size small while staying easy to extend.

## Android Build Ready

The project is prepared for Expo EAS Build, including APK generation for direct device installation.

Files already configured:

- `app.json`
- `eas.json`

### Build APK

```bash
eas build --platform android --profile preview
```

## Local Development

### Install

```bash
npm install
```

### Run

```bash
npm run start
```

### Platform Shortcuts

```bash
npm run android
npm run ios
npm run web
```

### Quality Checks

```bash
npm run typecheck
npm run lint
npm run lint:fix
npm run format
```

## Project Scripts

```json
{
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier . --write",
  "format:check": "prettier . --check",
  "typecheck": "tsc --noEmit"
}
```

## Current Status

This is a functional mobile MVP with strong foundations for continued growth.

Already implemented:

- Real project CRUD
- Per-project contracts and metadata
- Per-project currencies
- Calendar-based worked-hours tracking
- Earnings summaries
- Holiday logic
- Monthly projections
- Settings and persistence
- Sidebar navigation
- EAS Android build configuration

## Next Improvements

Potential next steps for product growth:

- Currency conversion logic in the Conversions section
- Advanced projection views by week and month
- Export to CSV or PDF
- Charts for hours and earnings history
- Authentication and cloud sync
- Automated tests with React Native Testing Library
- CI pipeline for lint, typecheck, and build verification

## Recruiter Summary

If you are reviewing this repository as part of a hiring process, this project demonstrates:

- end-to-end mobile feature implementation
- clean state management and maintainable folder structure
- strong TypeScript modeling
- practical UI/UX decisions for real users
- ability to translate product requirements into working business logic
- attention to delivery details such as persistence, navigation, and Android packaging

## License

This project is for portfolio and technical demonstration purposes.
