# Expense Tracker App

A modern, feature-rich expense tracker application built with Angular 21 for managing personal finances.

## Features

### 1. **Authentication (Login & Registration)**
- Secure login and signup functionality
- Demo account: `demo@example.com` / `demo123`
- User data persistence with localStorage
- Session management

### 2. **Dashboard**
- Overview of financial summary with cards showing:
  - Total Balance (Income - Expenses)
  - Total Income
  - Total Expenses
  - Transaction Count
- Recent transactions list (last 10)
- Quick delete functionality for transactions
- Responsive design

### 3. **Add Transactions**
- Add expense or income transactions
- Pre-defined categories:
  - **Expenses**: Food, Transportation, Utilities, Entertainment, Healthcare, Other
  - **Income**: Salary, Freelance, Investment, Bonus, Other
- Amount and description input
- Date picker for transaction date
- Form validation
- Success confirmation

### 4. **Analytics**
- **Income vs Expenses Chart**: Visual comparison using bar charts
- **Expense Breakdown**: Category-wise expense analysis with percentages
- **Income Breakdown**: Category-wise income analysis with percentages
- **Summary Statistics**:
  - Total Transactions
  - Average Transaction Amount
  - Net Balance
  - Expense Ratio (%)

### 5. **Export Data**
- **Export as CSV**: Download transactions for spreadsheet applications
- **Export as JSON**: Complete backup of transaction data and user info
- **Export as PDF**: Generates a detailed financial report
- Export summary showing transaction counts and balances

### 6. **Navigation**
- Sticky navigation bar with quick links
- Active route highlighting
- User welcome message
- Logout functionality

## Tech Stack

- **Framework**: Angular 21
- **Language**: TypeScript
- **State Management**: Angular Signals
- **Forms**: Reactive Forms
- **Styling**: CSS3 with responsive design
- **Storage**: Browser localStorage

## Project Structure

```
src/
├── app/
│   ├── models/
│   │   └── transaction.ts          # Data models
│   ├── services/
│   │   ├── auth.service.ts         # Authentication logic
│   │   └── transaction.service.ts  # Transaction management
│   ├── guards/
│   │   └── auth.guard.ts           # Route protection
│   ├── components/
│   │   ├── login/                  # Login & registration
│   │   ├── dashboard/              # Main dashboard
│   │   ├── balance-summary/        # Summary cards
│   │   ├── transaction-list/       # Recent transactions
│   │   ├── add-transaction/        # Add transaction form
│   │   ├── analytics/              # Analytics & charts
│   │   └── export-data/            # Export functionality
│   ├── app.routes.ts               # Routing configuration
│   ├── app.config.ts               # App configuration
│   └── app.ts                      # Root component
├── styles.css                       # Global styles
└── main.ts                         # Entry point
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI

### Installation

1. Navigate to the project directory:
   ```bash
   cd expence-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve --port 4300
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:4300
   ```

## Usage

### First Login
1. Use demo credentials:
   - Email: `demo@example.com`
   - Password: `demo123`

### Adding a Transaction
1. Click "Add Transaction" in the navigation
2. Select transaction type (Expense or Income)
3. Choose a category
4. Enter amount and description
5. Select date
6. Click "Add Transaction"

### Viewing Analytics
1. Click "Analytics" in the navigation
2. View income vs expenses chart
3. See category breakdowns with percentages
4. Review summary statistics

### Exporting Data
1. Click "Export Data" in the navigation
2. Choose export format:
   - CSV for spreadsheet software
   - JSON for backup and data analysis
   - PDF for detailed reports
3. File will download automatically

## Features Details

### Authentication
- **Local Storage**: User credentials and transaction data are stored in browser localStorage
- **Demo Account**: Pre-configured demo user for testing
- **User Registration**: Create new accounts with email and password
- **Session Persistence**: Automatically logs in if session data exists

### Transaction Management
- **CRUD Operations**: Create, Read, Update, Delete transactions
- **Category Organization**: Pre-defined categories for better organization
- **Flexible Dates**: Use any date for transactions
- **Balance Calculation**: Automatic calculation of income, expenses, and net balance

### Data Export
- **CSV Format**: Compatible with Excel, Google Sheets, etc.
- **JSON Format**: Complete data export with metadata
- **PDF Reports**: Text-based financial reports with summaries

### Responsive Design
- Mobile-friendly layout
- Adaptive navigation
- Responsive grid layouts
- Touch-friendly buttons and inputs

## Best Practices Implemented

- ✅ Standalone components (Angular 21+)
- ✅ Signals for state management
- ✅ Reactive Forms validation
- ✅ Route guards for authentication
- ✅ OnPush change detection strategy
- ✅ Type-safe TypeScript
- ✅ Responsive CSS Grid layouts
- ✅ Accessibility considerations
- ✅ Component composition and reusability

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Limitations & Future Enhancements

### Current Limitations
- Data is stored locally in browser (not synced across devices)
- No password encryption (demo purposes only)
- CSV/JSON/PDF export is basic format

### Potential Enhancements
- Backend API integration
- Cloud data synchronization
- Advanced charting library (Chart.js)
- Budget goals and spending limits
- Recurring transactions
- Multi-currency support
- Mobile app (React Native/Flutter)
- Data import from bank statements
- Advanced filtering and search
- Monthly/yearly reports
- Dark mode theme

## Development Notes

### Running Tests
```bash
ng test
```

### Building for Production
```bash
ng build --configuration production
```

### Code Style
- TypeScript strict mode enabled
- ESLint configuration available
- Prettier for code formatting

## Security Notes

⚠️ **Important**: This is a client-side application with data stored in localStorage. For production:
- Implement backend authentication
- Use secure session management
- Encrypt sensitive data
- Use HTTPS
- Implement proper password hashing

## License

MIT License - Feel free to use this project for personal or educational purposes.

## Support

For issues or feature requests, please create an issue in the repository or contact the development team.

---

**Happy Tracking!** 💰📊
