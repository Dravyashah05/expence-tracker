# Quick Start Guide - Expense Tracker App

## 🚀 Getting Started

### Step 1: Navigate to Project
```bash
cd d:\Final Year Project\expence-tracker
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start Development Server
```bash
ng serve --port 4300
```

The app will be available at: `http://localhost:4300`

## 📝 Demo Credentials

**Email:** `demo@example.com`  
**Password:** `demo123`

## 🎯 App Features

### 1️⃣ Login Page
- Sign in with demo credentials
- Create a new account
- Credentials are saved locally

### 2️⃣ Dashboard
- View financial summary (Balance, Income, Expenses)
- See recent transactions (last 10)
- Delete transactions with confirmation

### 3️⃣ Add Transaction
- Add expenses or income
- Choose from pre-defined categories
- Set amount, description, and date
- Form validation included

### 4️⃣ Analytics
- View income vs expenses bar chart
- See category breakdowns
- View percentage distribution
- Summary statistics:
  - Total transactions
  - Average transaction
  - Net balance
  - Expense ratio

### 5️⃣ Export Data
- **CSV**: Download to Excel/Sheets
- **JSON**: Complete data backup
- **PDF**: Financial report

### 🔐 Logout
- Click logout button in header
- Returns to login page

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/app/services/auth.service.ts` | User authentication |
| `src/app/services/transaction.service.ts` | Transaction CRUD operations |
| `src/app/components/` | All UI components |
| `src/styles.css` | Global styling |
| `src/app/app.routes.ts` | Route configuration |

## 🏗️ Component Structure

```
App Root
├── Login Component (auth required)
│   ├── Login form
│   └── Register form
├── Dashboard (with auth guard)
│   ├── Balance Summary
│   └── Transaction List
├── Add Transaction (with auth guard)
├── Analytics (with auth guard)
└── Export Data (with auth guard)
```

## 💾 Data Storage

- **Where**: Browser localStorage
- **What**: User credentials, transactions
- **Backup**: Export as JSON from Export Data page

## 🎨 Color Scheme

- **Primary**: #667eea (Purple)
- **Secondary**: #764ba2 (Dark Purple)
- **Success**: #27ae60 (Green) - Income
- **Danger**: #e74c3c (Red) - Expenses
- **Warning**: #f39c12 (Orange)

## 🔄 Data Flow

```
User Input
    ↓
Reactive Forms (Form Group)
    ↓
Component Handler
    ↓
Service (Signal Update)
    ↓
Computed Signals
    ↓
Template Update (via signals)
    ↓
localStorage Save
```

## 🛠️ Troubleshooting

### Port 4200/4300 already in use?
```bash
ng serve --port 4301
```

### Clear localStorage data?
Open DevTools (F12) → Application → Storage → Local Storage → Clear

### Build for production?
```bash
ng build --configuration production
```

## 📱 Responsive Design

✅ Works on:
- Desktop (1920px+)
- Tablet (768px - 1920px)
- Mobile (320px - 768px)

## ⚡ Performance Tips

- Signals provide reactive updates without zones
- OnPush change detection for optimization
- Lazy loading for feature routes
- No unnecessary re-renders

## 🔒 Security Notes

⚠️ **For Development Only**
- Passwords stored in plain text (use hashing in production)
- Data stored locally (use backend + HTTPS in production)
- No CSRF protection (add in production)

## 📚 Learn More

- [Angular Docs](https://angular.dev)
- [Signals Guide](https://angular.dev/guide/signals)
- [Reactive Forms](https://angular.dev/guide/forms/reactive-forms)

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Blank page after login | Check DevTools console for errors |
| Transactions not saving | Browser storage might be disabled |
| Charts not showing | Ensure transactions exist in dashboard |
| Can't export data | Must have at least one transaction |

## 📊 Example Workflow

1. Login with demo@example.com / demo123
2. Go to "Add Transaction"
3. Add a few expenses and income entries
4. View Dashboard to see summary
5. Click Analytics to see breakdown
6. Click Export Data to download as CSV/JSON/PDF

---

**Ready to track expenses? Let's go! 🎉**
