# Rupee Application

A modern personal finance tracker built with **Angular 21** and **TypeScript**. Track income and expenses, view analytics, and export your data.

## Key Features

- **User authentication** - Register and sign in with secure credentials.
- **Profile management** - Edit profile details, change password, and upload a compressed profile image (under 1 MB).
- **Theme and localization** - Dark mode, theme color, currency, and language preferences.
- **Expense and income tracking** - Add, update, and delete transactions with quick amounts.
- **Analytics** - Spend summaries and category insights.
- **Data export** - Export CSV, JSON, and text reports.
- **Responsive UI** - Works on desktop, tablet, and mobile.
- **Loading feedback** - Small in-theme loaders for key actions and page reloads.

## Quick Start

### Prerequisites
- Node.js v18+
- npm v9+

### Installation & Run

```bash
# Install dependencies
npm install

# Start frontend + API server
npm run dev

# Open in browser
http://localhost:4200
```

### Demo Login
- **Email:** `demo@example.com`
- **Password:** `demo123`

## Project Structure

```
src/app/
+-- models/              # Data models
+-- services/            # Business logic
+-- guards/              # Route protection
+-- components/
¦   +-- login/          # Authentication
¦   +-- dashboard/      # Main layout
¦   +-- add-transaction/# Form to add transactions
¦   +-- analytics/      # Charts & reports
¦   +-- export-data/    # Export functionality
¦   +-- profile/        # Profile management
+-- app.routes.ts       # Routing configuration
```

## Documentation

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](QUICK_START.md) | 5-minute setup guide |
| [FEATURES.md](FEATURES.md) | Detailed feature documentation |
| [API_REFERENCE.md](API_REFERENCE.md) | Service and component APIs |
| [BUILD_SUMMARY.md](BUILD_SUMMARY.md) | Project completion details |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment guide |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common issues & solutions |
| [FILE_INVENTORY.md](FILE_INVENTORY.md) | Complete file listing |

## Development

### Start Development Server

```bash
npm run dev
```

The application will automatically reload when you modify source files.

### Generate New Component

```bash
ng generate component component-name
```

### Build for Production

```bash
ng build --configuration production
```

Output will be in `dist/expence-tracker/browser/`.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

