# 💰 Expense Tracker Application

A modern, feature-rich personal finance tracker built with **Angular 21** and **TypeScript**. Track your income and expenses, view detailed analytics, and export your financial data.

## ✨ Key Features

- 🔐 **User Authentication** - Secure login and registration
- 💵 **Expense & Income Tracking** - Add and manage transactions
- 📊 **Financial Analytics** - Visual charts and category breakdown
- 📤 **Data Export** - Export as CSV, JSON, or PDF
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ⚡ **Real-time Updates** - Instant calculations with Angular Signals
- 💾 **Local Storage** - No server required for testing

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm v9+

### Installation & Run

```bash
# Install dependencies
npm install

# Start development server
ng serve --port 4300

# Open in browser
http://localhost:4300
```

### Demo Login
- **Email:** `demo@example.com`
- **Password:** `demo123`

## 📁 Project Structure

```
src/app/
├── models/              # Data models
├── services/            # Business logic
├── guards/              # Route protection
├── components/
│   ├── login/          # Authentication
│   ├── dashboard/      # Main layout
│   ├── add-transaction/# Form to add transactions
│   ├── analytics/      # Charts & reports
│   └── export-data/    # Export functionality
└── app.routes.ts       # Routing configuration
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](QUICK_START.md) | 5-minute setup guide |
| [FEATURES.md](FEATURES.md) | Detailed feature documentation |
| [API_REFERENCE.md](API_REFERENCE.md) | Service and component APIs |
| [BUILD_SUMMARY.md](BUILD_SUMMARY.md) | Project completion details |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Production deployment guide |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common issues & solutions |
| [FILE_INVENTORY.md](FILE_INVENTORY.md) | Complete file listing |

## 🛠️ Development

### Start Development Server

```bash
ng serve --port 4300
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
