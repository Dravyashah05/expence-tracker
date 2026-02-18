# 🐛 Troubleshooting Guide

## Common Issues & Solutions

---

## 🔴 Critical Issues

### Issue 1: App Won't Start (Port Already in Use)

**Error Message:**
```
Error: Port 4200 is already in use. Use '--port' to specify a different port.
```

**Solutions:**
1. Use a different port:
   ```bash
   ng serve --port 4300
   ```

2. Or kill the process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :4200
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -i :4200
   kill -9 <PID>
   ```

---

### Issue 2: Blank Page After Login

**Possible Causes:**
- Console errors preventing render
- localStorage disabled
- Routing configuration issue

**Solutions:**
1. **Check Console** (F12):
   - Look for red error messages
   - Check network tab for failed requests

2. **Enable localStorage**:
   - Chrome: Settings → Privacy → Cookies and other site data (Allow all)
   - Firefox: About:config → dom.storage.enabled = true

3. **Check routing**:
   - Verify `app.routes.ts` has correct paths
   - Check if `authGuard` is blocking access

4. **Clear localStorage**:
   ```javascript
   localStorage.clear();
   // Then refresh page
   ```

---

### Issue 3: "Cannot find module" Errors

**Error:**
```
Cannot find module '@angular/core' or similar
```

**Solutions:**
1. Install dependencies:
   ```bash
   npm install
   ```

2. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Check Node version:
   ```bash
   node --version  # Should be v18+
   npm --version   # Should be v9+
   ```

---

## 🟠 UI/UX Issues

### Issue 4: Styles Not Loading (Blank White Page)

**Solutions:**
1. Check `styles.css` is imported:
   ```typescript
   // In app.ts or main.ts
   import '../styles.css';
   ```

2. Rebuild:
   ```bash
   ng serve --poll=1000
   ```

3. Clear browser cache:
   - Ctrl+Shift+Delete (Windows)
   - Cmd+Shift+Delete (Mac)

---

### Issue 5: Responsive Design Issues

**Problem:** Layout broken on mobile

**Solutions:**
1. Check viewport meta tag in `index.html`:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1">
   ```

2. Test in Chrome DevTools:
   - F12 → Toggle Device Toolbar (Ctrl+Shift+M)
   - Test different screen sizes

3. Check CSS media queries:
   - Verify breakpoints are correct
   - Test with different zoom levels

---

### Issue 6: Forms Not Validating

**Problem:** Form submits with invalid data

**Solutions:**
1. Check form validators:
   ```typescript
   form = this.fb.group({
     email: ['', [Validators.required, Validators.email]],
     // ...
   });
   ```

2. Verify form binding:
   ```html
   <form [formGroup]="form" (ngSubmit)="onSubmit()">
   ```

3. Check submit button:
   ```html
   <button [disabled]="form.invalid">Submit</button>
   ```

---

## 🟡 Authentication Issues

### Issue 7: Can't Login with Demo Account

**Demo Credentials:**
- Email: `demo@example.com`
- Password: `demo123`

**Solutions:**
1. Check localStorage:
   ```javascript
   // In browser console
   JSON.parse(localStorage.getItem('users'))
   ```

2. Reset localStorage:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

3. Verify AuthService:
   - Check `auth.service.ts` login method
   - Verify email and password match exactly

---

### Issue 8: Login Doesn't Work (Always Fails)

**Solutions:**
1. **Check console for errors**:
   - Open DevTools (F12)
   - Go to Console tab
   - Look for red errors

2. **Verify auth.guard.ts** is imported in routes:
   ```typescript
   import { authGuard } from './guards/auth.guard';
   ```

3. **Check localStorage in auth.service.ts**:
   - Look for typos in storage keys
   - Verify JSON parsing is correct

4. **Enable browser storage**:
   - Developer Tools → Application → Storage
   - Verify localStorage is enabled

---

### Issue 9: Session Not Persisting After Refresh

**Solutions:**
1. Check localStorage saving:
   ```typescript
   localStorage.setItem('currentUser', JSON.stringify(user));
   ```

2. Verify AuthService constructor loads user:
   ```typescript
   constructor() {
     this.loadUserFromStorage();
   }
   ```

3. Check browser storage settings:
   - Site might be in incognito/private mode
   - Storage might be disabled

---

## 💾 Data Issues

### Issue 10: Transactions Not Saving

**Solutions:**
1. **Check localStorage is enabled**:
   - Settings → Privacy → Allow storage

2. **Verify TransactionService is saving**:
   ```typescript
   // Should see in localStorage
   console.log(localStorage.getItem('transactions_userId'))
   ```

3. **Check for errors**:
   - Open console (F12)
   - Add console.log in addTransaction method

4. **Verify localStorage quota**:
   ```javascript
   // Check available storage
   console.log(navigator.storage.estimate())
   ```

---

### Issue 11: Can't Delete Transactions

**Solutions:**
1. Check delete button has click handler:
   ```html
   <button (click)="deleteTransaction(id)">Delete</button>
   ```

2. Verify confirmation dialog shows:
   ```typescript
   if (confirm('Are you sure?')) {
     this.transactionService.deleteTransaction(id);
   }
   ```

3. Check that service method is called:
   ```typescript
   deleteTransaction(id: string): void {
     this.transactions.update(trans => trans.filter(t => t.id !== id));
     this.saveTransactions();
   }
   ```

---

### Issue 12: Analytics Not Showing

**Solutions:**
1. **Add some transactions first**:
   - Go to "Add Transaction"
   - Add 2-3 expenses and income

2. **Check computed signals**:
   - Open DevTools console
   - Check if data is loaded

3. **Verify analytics component**:
   - Check computed() functions in analytics.component.ts
   - Look for any calculation errors

4. **Test with demo data**:
   - If new account, add several transactions first

---

## 📤 Export Issues

### Issue 13: Can't Export Data (Button Disabled)

**Solution:**
- Add at least one transaction first
- Transactions must be created before export

**To add a transaction:**
1. Click "Add Transaction"
2. Fill in the form
3. Click "Add Transaction"
4. Now export buttons should be enabled

---

### Issue 14: Exported File Not Downloaded

**Solutions:**
1. **Check browser downloads**:
   - Check Downloads folder
   - Check browser's download history

2. **Check browser permissions**:
   - Settings → Privacy → Site permissions → Downloads
   - Allow downloads for this site

3. **Try different export format**:
   - CSV might not work, try JSON
   - Or try PDF export

4. **Check file size**:
   ```javascript
   // In console
   const blob = new Blob(['test'], {type: 'text/csv'});
   console.log(blob.size); // Should be > 0
   ```

---

## 🔐 Security/Permission Issues

### Issue 15: CORS Errors (When Connected to Backend)

**Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**
1. **For development**, add to backend:
   ```javascript
   // Express.js example
   app.use(cors({
     origin: 'http://localhost:4200',
     credentials: true
   }));
   ```

2. **For production**, use proper CORS headers:
   ```
   Access-Control-Allow-Origin: https://yourdomain.com
   ```

---

### Issue 16: localStorage Access Denied

**Error:**
```
QuotaExceededError: DOM Exception 22
```

**Solutions:**
1. **Clear old data**:
   ```javascript
   localStorage.clear();
   ```

2. **Check quota**:
   ```javascript
   navigator.storage.estimate().then(estimate => {
     console.log(`Used: ${estimate.usage}, Available: ${estimate.quota}`);
   });
   ```

3. **Reduce data size**:
   - Export and backup data
   - Clear old transactions
   - Delete old user accounts

---

## 🎨 Browser Compatibility Issues

### Issue 17: App Works in Chrome but Not Other Browsers

**Solutions:**
1. **Check browser support**:
   - Chrome: ✅ Full support
   - Firefox: ✅ Full support
   - Safari: ✅ Full support (needs polyfills)
   - Edge: ✅ Full support

2. **Test in DevTools**:
   - Chrome DevTools → Console
   - Check for any JS errors
   - Check browser compatibility

3. **Check for unsupported features**:
   - localStorage: Supported in all modern browsers
   - Signals: Angular 21+ feature
   - Flex/Grid: Supported in all modern browsers

---

## 🔧 Build/Compilation Issues

### Issue 18: TypeScript Compilation Errors

**Error:**
```
error TS2305: Module 'X' has no exported member 'Y'
```

**Solutions:**
1. **Check imports**:
   ```typescript
   // Make sure path is correct
   import { Component } from '@angular/core';
   ```

2. **Rebuild**:
   ```bash
   ng build
   ```

3. **Check tsconfig.json**:
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true
     }
   }
   ```

---

### Issue 19: Build Fails with Memory Error

**Error:**
```
JavaScript heap out of memory
```

**Solutions:**
1. **Increase Node memory**:
   ```bash
   node --max-old-space-size=4096 node_modules/@angular/cli/bin/ng build
   ```

2. **Or use npm script**:
   ```bash
   set NODE_OPTIONS=--max-old-space-size=4096
   ng build
   ```

3. **Reduce bundle size**:
   - Remove unused dependencies
   - Use lazy loading for routes
   - Enable tree-shaking

---

## 📱 Mobile-Specific Issues

### Issue 20: Touch/Click Events Not Working on Mobile

**Solutions:**
1. **Ensure buttons are clickable**:
   ```css
   button {
     min-width: 44px;
     min-height: 44px;
     padding: 0.75rem;
   }
   ```

2. **Test on real device**:
   - Use Chrome Remote Debugging
   - Or use browser DevTools device simulation

3. **Check event listeners**:
   ```html
   <button (click)="handler()">Click Me</button>
   ```

---

## 🔍 Debugging Tips

### Enable Debug Mode
```typescript
// In main.ts
import { enableDebugTools } from '@angular/platform-browser';

const appRef = createApplication();
const componentRef = appRef.bootstrap(App);
enableDebugTools(componentRef);
```

### Check Component State
```typescript
// In component
ngAfterViewInit() {
  console.log('Current balance:', this.totalBalance());
  console.log('All transactions:', this.allTransactions());
}
```

### Monitor Signal Changes
```typescript
// In component
constructor() {
  effect(() => {
    console.log('Balance changed to:', this.totalBalance());
  });
}
```

### Use DevTools
1. **Open DevTools** (F12)
2. **Elements Tab**: Inspect HTML
3. **Console Tab**: Run JavaScript
4. **Network Tab**: Check API calls
5. **Application Tab**: Check localStorage
6. **Performance Tab**: Check performance

---

## 📞 Getting Help

### Before Asking for Help

1. **Check Console** (F12)
   - Look for red error messages
   - Copy the full error

2. **Check localStorage**:
   ```javascript
   // In console
   localStorage
   ```

3. **Check Network Tab**:
   - Any failed requests?
   - Any CORS errors?

4. **Search Documentation**:
   - Check FEATURES.md
   - Check API_REFERENCE.md
   - Check BUILD_SUMMARY.md

### Information to Provide

When reporting an issue, include:
- [ ] Error message (copy-paste from console)
- [ ] Steps to reproduce
- [ ] Browser and version
- [ ] Operating system
- [ ] What you expected vs what happened
- [ ] Screenshot if visual issue

---

## ✅ Verification Checklist

Before reporting a bug, verify:
- [ ] Dependencies installed (`npm install`)
- [ ] No console errors (F12)
- [ ] localStorage enabled
- [ ] Browser cache cleared (Ctrl+Shift+Delete)
- [ ] Using demo account credentials
- [ ] Added at least one transaction
- [ ] Using latest Angular version

---

## 🎯 Quick Fixes (Copy-Paste)

### Clear Everything and Start Fresh
```javascript
// Paste in browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Check App Status
```javascript
// In console
console.log('Users:', JSON.parse(localStorage.getItem('users')));
console.log('Current User:', JSON.parse(localStorage.getItem('currentUser')));
console.log('Transactions:', Object.keys(localStorage)
  .filter(k => k.startsWith('transactions_'))
  .forEach(k => console.log(k, JSON.parse(localStorage.getItem(k)))));
```

### Add Sample Transaction Programmatically
```javascript
// In console (after login)
const transaction = {
  id: Date.now().toString(),
  type: 'expense',
  category: 'Food',
  amount: 25.50,
  description: 'Test transaction',
  date: new Date().toISOString()
};
const userId = JSON.parse(localStorage.getItem('currentUser')).id;
const transactions = JSON.parse(localStorage.getItem(`transactions_${userId}`) || '[]');
transactions.push(transaction);
localStorage.setItem(`transactions_${userId}`, JSON.stringify(transactions));
location.reload();
```

---

**Still having issues? Check the documentation files or create an issue!**

🔗 Files to check:
- `QUICK_START.md` - Setup help
- `FEATURES.md` - Feature guide
- `API_REFERENCE.md` - Technical details
- `BUILD_SUMMARY.md` - Build info

---

*Last Updated: 2024*  
*Version: 1.0*
